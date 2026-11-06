#!/usr/bin/env python3
"""
Plative Branded UPN Diagram Builder (Lucid Standard Import JSON)

Generates a Plative-branded UPN (Universal Process Notation) diagram as a Lucid
Standard Import document — the exact JSON the Lucid connector tool
`lucid_create_diagram_from_specification` ingests, and the same format Lucid's
`.lucid` import packages use.

This is a self-contained port of Plative's UPN engine (originally UPNBuilder in
plaito/integrations/lucid_diagrams.py). It has NO third-party dependencies — pure
Python standard library — and does NOT talk to any API. It only builds the JSON.
Delivery into Lucid is handled separately:
  - primary:  the caller passes this JSON to the Lucid connector's
              `lucid_create_diagram_from_specification` (with use_assisted_layout=false)
  - fallback: `--lucid out.lucid` writes an importable .lucid package for File > Import

Usage:
    python build_upn.py config.json                 # print document.json to stdout
    cat config.json | python build_upn.py -         # read config from stdin
    python build_upn.py config.json -o document.json
    python build_upn.py config.json --lucid diagram.lucid
    python build_upn.py config.json --strip-groups  # omit page-level "groups" array

Config JSON (all keys mirror the original Plaito tool):
    {
      "title": "Quote-to-Cash Process",
      "process_area": "Sales",            # color theme (name or #hex)
      "direction": "horizontal",          # or "vertical"
      "steps": [ { ...step objects... } ],
      "connections": [ ... ],             # optional; disables autoConnect when present
      "callouts": [ ... ],                # optional annotations
      "startNode": { "row": 0, "col": -1 },   # optional grid placement
      "endNode":   { "row": 0, "col": 8 }     # optional grid placement
    }
See references/upn-authoring.md for the full step / connection / callout schema.
"""

import argparse
import io
import json
import sys
import zipfile


# ─── Defaults (Plative UPN card dimensions & palette) ────────────────────────

DEFAULTS = {
    # Activity Box — Plative UPN card dimensions
    # Matches actual Plative shared shape: 360 × 368 px
    "boxWidth": 400,
    "boxHeight": 400,
    "bandHeight": 16,
    "triangleSize": 85,       # Drilldown triangle scaled proportionally
    "spacingX": 100,
    "spacingY": 120,
    "startX": 120,
    "startY": 100,
    "bodyRounding": 20,       # Rounding: 20 in library (matching spec)
    "bodyStrokeWidth": 3,     # LineWidth: 3 in library (matching spec)

    # Start/End nodes — from Plative shape library
    "startNodeSize": 44,      # Outer circle ~63 in library, scaled
    "startInnerSize": 33,     # Inner circle ~47 in library, scaled
    "endNodeSize": 42,        # End terminator ~54x60 in library, scaled

    # Colors — exact Plative UPN palette
    "defaultColor": "#af1c11",  # SecondaryColor from SFACard (Plative red)
    "bodyFill": "#FFFFFF",
    "bodyStroke": "#000000",
    "lineColor": "#3a414a",     # Connector line color from library
    "startColor": "#008a0e",    # Process Start green from library
    "endColor": "#af1c11",      # Process End red from library
    "fontSize": 11,
}


# ─── Color Presets ───────────────────────────────────────────────────────────

COLORS = {
    "sales": "#4A90D9",
    "delivery": "#7B61FF",
    "finance": "#50C878",
    "operations": "#FF8C42",
    "support": "#E74C3C",
    "default": "#6C757D",
    "blue": "#4A90D9",
    "purple": "#7B61FF",
    "green": "#50C878",
    "orange": "#FF8C42",
    "red": "#E74C3C",
    "gray": "#6C757D",
    "teal": "#20B2AA",
    "pink": "#FF69B4",
}


# ─── Shape validation ────────────────────────────────────────────────────────
# The branded UPN cards only ever emit these primitive shape types, and every
# one of them is present in the Lucid Standard Import registry the connector
# uses. We validate to catch typos before handing the JSON to Lucid.

VALID_SHAPE_TYPES = {
    "rectangle", "circle", "diamond", "triangle", "rightTriangle",
    "isoscelesTriangle", "parallelogram", "trapezoid", "pentagon", "hexagon",
    "octagon", "cross", "cloud", "singleArrow", "doubleArrow", "polyStar",
}


def validate_shapes(shapes):
    """Validate all shapes have a recognized type. Raises ValueError listing any invalid types."""
    invalid = [(s.get("id", "?"), s.get("type", "?")) for s in shapes if s.get("type") not in VALID_SHAPE_TYPES]
    if invalid:
        bad = ", ".join(f"{sid} ({stype})" for sid, stype in invalid)
        raise ValueError(
            f"Invalid shape type(s) found: {bad}. "
            f"Valid types: {sorted(VALID_SHAPE_TYPES)}. "
            f"Tip: use 'rectangle' with style.rounding for rounded corners."
        )


# ─── Helpers ─────────────────────────────────────────────────────────────────

_id_counter = 0


def _reset_ids():
    global _id_counter
    _id_counter = 0


def _uid(prefix="el"):
    global _id_counter
    _id_counter += 1
    return f"{prefix}_{_id_counter}"


def _darken_color(hex_color, amount=0.2):
    hex_color = hex_color.lstrip("#")
    num = int(hex_color, 16)
    r = max(0, int(((num >> 16) & 0xFF) * (1 - amount)))
    g = max(0, int(((num >> 8) & 0xFF) * (1 - amount)))
    b = max(0, int((num & 0xFF) * (1 - amount)))
    return f"#{(r << 16 | g << 8 | b):06x}"


def _resolve_color(color):
    """Resolve a color name or hex value to a hex color."""
    if not color:
        return DEFAULTS["defaultColor"]
    return COLORS.get(color.lower() if isinstance(color, str) else color, color)


# ─── Activity Box Builder ────────────────────────────────────────────────────

def create_activity_box(config):
    """
    Create a UPN Activity Box (multi-component structure matching the Plative VSDX card).

    This function creates a UPN activity box as a group of 7-9 separate shapes:
    1. Outer container (rounded rectangle - white body)
    2. Footer banner (rectangle - colored with "System(s)" text)
    3. Header text block (step number and activity name)
    4. Divider line (thin rectangle - colored, separates header from RACI)
    5-8. RACI text blocks (R, A, C, I with colored labels)
    9. Drilldown triangle (optional, top-right corner)

    Args:
        config: dict with keys:
            id, stepNumber, name, x, y, responsible, accountable,
            consulted, informed, system, color, hasDrilldown, width, height

    Returns:
        dict with keys: shapes (list), groups (list), mainId (str)
    """
    box_id = config["id"]
    step_number = config.get("stepNumber", "")
    name = config.get("name", "")
    x = config["x"]
    y = config["y"]
    responsible = config.get("responsible", "")
    accountable = config.get("accountable", "")
    consulted = config.get("consulted", "")
    informed = config.get("informed", "")
    system = config.get("system", "System(s)")
    color = config.get("color", DEFAULTS["defaultColor"])
    has_drilldown = config.get("hasDrilldown", False)
    width = config.get("width", DEFAULTS["boxWidth"])
    height = config.get("height", DEFAULTS["boxHeight"])

    resolved_color = _resolve_color(color)

    # Layout constants (exact measurements from Plative UPN card)
    footer_height = 40       # Footer: 40px height
    divider_height = 1.2
    text_height = 30         # Increased for better text rendering
    text_padding = 13        # Left padding: 13px
    header_y_offset = 28     # Header: 28px from top
    divider_y_offset = 87    # Divider: 87px from top
    tri_size = DEFAULTS["triangleSize"]

    # IDs for all components
    container_id = f"{box_id}_container"
    footer_id = f"{box_id}_footer"
    divider_id = f"{box_id}_divider"
    header_id = f"{box_id}_header"
    raci_r_id = f"{box_id}_raci_r"
    raci_a_id = f"{box_id}_raci_a"
    raci_c_id = f"{box_id}_raci_c"
    raci_i_id = f"{box_id}_raci_i"
    tri_id = f"{box_id}_tri"
    group_id = f"{box_id}_group"

    shapes = []
    group_items = []

    # === Layer 1: Outer Container ===
    # White rounded rectangle container
    shapes.append({
        "id": container_id,
        "type": "rectangle",
        "boundingBox": {"x": x, "y": y, "w": width, "h": height},
        "text": "",  # No text in container, text is in separate blocks
        "style": {
            "fill": {"type": "color", "color": DEFAULTS["bodyFill"]},
            "stroke": {
                "color": DEFAULTS["bodyStroke"],
                "width": DEFAULTS["bodyStrokeWidth"],
                "style": "solid",
            },
            "rounding": DEFAULTS["bodyRounding"],
        },
    })
    group_items.append(container_id)

    # === Layer 2: Footer Banner ===
    # Colored rectangle at BOTTOM with white "System(s)" text
    footer_y = y + height - (2 * footer_height)  # Position at bottom of container
    shapes.append({
        "id": footer_id,
        "type": "rectangle",
        "boundingBox": {"x": x, "y": footer_y, "w": width, "h": footer_height},
        "text": (
            f'<div style="color:#FFFFFF;font-size:10pt;text-align:center;'
            f"font-weight:600;font-family:'Open Sans',Arial,sans-serif\">"
            f"{system}</div>"
        ),
        "style": {
            "fill": {"type": "color", "color": resolved_color},
            "stroke": {"width": 0},  # No border
        },
    })
    group_items.append(footer_id)

    # === Layer 3: Header Text ===
    # Bold step number and activity name at TOP
    header_y = y + header_y_offset  # 28px from top
    shapes.append({
        "id": header_id,
        "type": "rectangle",
        "boundingBox": {
            "x": x + text_padding,
            "y": header_y,
            "w": width - (100 if has_drilldown else 26),  # Leave space for triangle
            "h": text_height,
        },
        "text": (
            f'<div style="font-size:12pt;font-weight:bold;text-align:left;'
            f"font-family:'Open Sans',Arial,sans-serif\">"
            f"{step_number} - {name}</div>"
        ),
        "style": {
            "fill": {"type": "color", "color": "#FFFFFF00"},  # Transparent (RRGGBBAA with alpha=0)
            "stroke": {"width": 0},
        },
    })
    group_items.append(header_id)

    # === Layer 4: Divider Line ===
    # Thin colored line BELOW header, extending to right edge
    divider_y = y + divider_y_offset  # 87px from top
    divider_width = width - text_padding  # Extend to right edge (with left padding)
    shapes.append({
        "id": divider_id,
        "type": "rectangle",
        "boundingBox": {
            "x": x + text_padding,  # Start from left padding
            "y": divider_y,
            "w": divider_width,
            "h": divider_height,
        },
        "style": {
            "fill": {"type": "color", "color": resolved_color},
            "stroke": {"width": 0},
        },
    })
    group_items.append(divider_id)

    # === Layers 5-8: RACI Text Blocks ===
    # Each RACI field as separate text block with colored labels
    # Position using exact Y offsets from Plative card
    raci_fields = [
        {"id": raci_r_id, "label": "R", "text": "Who is Responsible", "value": responsible, "yOffset": 94},
        {"id": raci_a_id, "label": "A", "text": "Who is Accountable", "value": accountable, "yOffset": 132},
        {"id": raci_c_id, "label": "C", "text": "Who is Consulted", "value": consulted, "yOffset": 171},
        {"id": raci_i_id, "label": "I", "text": "Who is Informed", "value": informed, "yOffset": 211, "xOffset": 8},  # Add small X offset for better spacing
    ]

    for field in raci_fields:
        raci_y = y + field["yOffset"]  # Exact Y position from container top
        x_offset = field.get("xOffset", 0)
        raci_x = x + text_padding + x_offset  # Use xOffset if provided
        # Show blank after pipe when value is empty (not placeholder text)
        display_text = field["value"] if field["value"] else ""

        shapes.append({
            "id": field["id"],
            "type": "rectangle",
            "boundingBox": {
                "x": raci_x,
                "y": raci_y,
                "w": width - 20 - x_offset,  # Adjust width if xOffset used
                "h": text_height,
            },
            "text": (
                f'<div style="font-size:10pt;text-align:left;'
                f"font-family:'Open Sans',Arial,sans-serif\">"
                f'<span style="color:{resolved_color};font-weight:bold">'
                f"{field['label']}</span> <b>|</b> {display_text}</div>"
            ),
            "style": {
                "fill": {"type": "color", "color": "#FFFFFF00"},  # Transparent
                "stroke": {"width": 0},
            },
        })
        group_items.append(field["id"])

    # === Layer 9: Drilldown Triangle (Optional) ===
    # Triangle at TOP-RIGHT corner
    if has_drilldown:
        shapes.append({
            "id": tri_id,
            "type": "rightTriangle",
            "boundingBox": {
                "x": x + width - tri_size,
                "y": y,  # Top of container
                "w": tri_size,
                "h": tri_size,
                "rotation": 180,  # Pointing right
            },
            "style": {
                "fill": {"type": "color", "color": resolved_color},
                "stroke": {"color": DEFAULTS["bodyStroke"], "width": 2, "style": "solid"},
            },
        })
        group_items.append(tri_id)

    # Group all components
    groups = [{"id": group_id, "items": group_items}]

    return {"shapes": shapes, "groups": groups, "mainId": container_id}


# ─── Start / End Nodes ───────────────────────────────────────────────────────

def create_start_node(base_id, x, y):
    """
    Process Start Terminator — Plative double-circle (green #008a0e).
    Outer green circle with inner green circle (white border).
    """
    outer_size = DEFAULTS["startNodeSize"]
    inner_size = DEFAULTS["startInnerSize"]
    offset = (outer_size - inner_size) / 2

    outer_id = f"{base_id}_outer"
    inner_id = f"{base_id}_inner"
    group_id = f"{base_id}_group"

    shapes = [
        {
            "id": outer_id,
            "type": "circle",
            "boundingBox": {"x": x, "y": y, "w": outer_size, "h": outer_size},
            "style": {
                "fill": {"type": "color", "color": DEFAULTS["startColor"]},
                "stroke": {"color": DEFAULTS["startColor"], "width": 1, "style": "solid"},
            },
        },
        {
            "id": inner_id,
            "type": "circle",
            "boundingBox": {
                "x": x + offset,
                "y": y + offset,
                "w": inner_size,
                "h": inner_size,
            },
            "style": {
                "fill": {"type": "color", "color": DEFAULTS["startColor"]},
                "stroke": {"color": "#FFFFFF", "width": 4, "style": "solid"},  # 4px white stroke per Plative spec
            },
        },
    ]

    groups = [{"id": group_id, "items": [outer_id, inner_id]}]

    return {"shapes": shapes, "groups": groups, "mainId": inner_id}


def create_end_node(base_id, x, y):
    """
    Process End Terminator — Plative red stop icon (#af1c11).
    Rendered as a red circle with an X mark.
    """
    size = DEFAULTS["endNodeSize"]
    end_id = f"{base_id}_end"

    shapes = [{
        "id": end_id,
        "type": "circle",
        "boundingBox": {"x": x, "y": y, "w": size, "h": size},
        "text": '<font style="font-size:16px;color:#FFFFFF"><b>✕</b></font>',
        "style": {
            "fill": {"type": "color", "color": DEFAULTS["endColor"]},
            "stroke": {"color": "#000000", "width": 2, "style": "solid"},
        },
    }]

    return {"shapes": shapes, "groups": [], "mainId": end_id}


# ─── Connection Line Builder ─────────────────────────────────────────────────

def create_connection(config):
    """
    Create a connection arrow between two shapes.

    Args:
        config: dict with keys:
            id         - Unique line ID
            from       - Source shape ID (mainId from create_activity_box)
            to         - Target shape ID
            label      - Output/input label on the arrow (optional)
            lineType   - "elbow", "straight", or "curved" (default: "elbow")
            fromPosition - Override source anchor {x, y} (0-1)
            toPosition   - Override target anchor {x, y} (0-1)

    Returns:
        Line object for the document.json
    """
    line_id = config["id"]
    from_id = config["from"]
    to_id = config["to"]
    label = config.get("label", "")
    line_type = config.get("lineType", "elbow")
    from_position = config.get("fromPosition", {"x": 1, "y": 0.5})  # right center (for L-to-R flow)
    to_position = config.get("toPosition", {"x": 0, "y": 0.5})       # left center

    line = {
        "id": line_id,
        "lineType": line_type,
        "endpoint1": {
            "type": "shapeEndpoint",
            "style": "none",
            "shapeId": from_id,
            "position": from_position,
        },
        "endpoint2": {
            "type": "shapeEndpoint",
            "style": "arrow",
            "shapeId": to_id,
            "position": to_position,
        },
        "stroke": {
            "color": DEFAULTS["lineColor"],
            "width": 1,
            "style": "solid",
        },
    }

    if label:
        # Wrap label text manually by inserting <br> tags
        # ~8px per char at 10pt bold; wrap at ~16 chars per line
        max_chars_per_line = 16
        words = label.split()
        wrapped_lines = []
        current_line = ""
        for word in words:
            if current_line and len(current_line) + 1 + len(word) > max_chars_per_line:
                wrapped_lines.append(current_line)
                current_line = word
            else:
                current_line = f"{current_line} {word}" if current_line else word
        if current_line:
            wrapped_lines.append(current_line)
        wrapped_label = "<br>".join(wrapped_lines)

        line["text"] = [{
            "text": f'<div style="text-align:center"><b>{wrapped_label}</b></div>',
            "position": 0.5,
            "side": "top",
        }]

    return line


# ─── Full UPN Document Builder ───────────────────────────────────────────────

class UPNBuilder:
    """
    Build a complete UPN document from a high-level config.

    Supports two layout modes:
    1. Linear layout: steps flow left-to-right or top-to-bottom in sequence.
    2. Grid layout: steps have explicit `row` and `col` for multi-line/branching diagrams.
       Grid mode is auto-detected when any step has a `row` or `col` property.

    Args:
        config: dict with keys:
            title (str)          - Document/page title
            layout (str)         - "horizontal" (default) or "vertical"
            color (str)          - Default color for all boxes
            steps (list)         - Array of step definitions (with optional row/col)
            connections (list)   - Array of connection definitions (optional)
            autoConnect (bool)   - Auto-connect steps in sequence (default: True)
            showStartEnd (bool)  - Add start/end nodes (default: True)
            startNode (dict)     - Grid placement for start node: {row, col} (optional)
            endNode (dict)       - Grid placement for end node: {row, col} (optional)
            callouts (list)      - Callout annotations (optional)
    """

    def __init__(self, config):
        self.config = config

    def _grid_position(self, row, col, box_w, box_h, sp_x, sp_y, grid_offset_x, grid_offset_y):
        """Convert grid (row, col) to pixel (x, y) coordinates."""
        x = DEFAULTS["startX"] + grid_offset_x + col * (box_w + sp_x)
        y = DEFAULTS["startY"] + grid_offset_y + row * (box_h + sp_y)
        return x, y

    def build(self):
        """Build and return the complete Standard Import JSON document."""
        _reset_ids()

        title = self.config.get("title", "UPN Process Diagram")
        layout = self.config.get("layout", "horizontal")
        color = self.config.get("color", DEFAULTS["defaultColor"])
        steps = self.config.get("steps", [])
        connections = self.config.get("connections", [])
        auto_connect = self.config.get("autoConnect", True)
        show_start_end = self.config.get("showStartEnd", True)
        start_node_cfg = self.config.get("startNode", None)
        end_node_cfg = self.config.get("endNode", None)

        is_horizontal = layout == "horizontal"
        box_w = DEFAULTS["boxWidth"]
        box_h = DEFAULTS["boxHeight"]

        # Calculate spacing based on the longest connection label word
        # so labels always fit between boxes
        all_labels = [c.get("label", "") for c in connections]
        longest_label_word = ""
        for lbl in all_labels:
            if lbl:
                for word in lbl.split():
                    if len(word) > len(longest_label_word):
                        longest_label_word = word
        # ~8px per char at 10pt bold + padding, minimum default spacing
        label_width = max(0, len(longest_label_word) * 8 + 40) if longest_label_word else 0
        sp_x = max(DEFAULTS["spacingX"], label_width)
        sp_y = max(DEFAULTS["spacingY"], label_width) if not is_horizontal else DEFAULTS["spacingY"]

        # Detect grid mode: any step has row or col
        use_grid = any(s.get("row") is not None or s.get("col") is not None for s in steps)

        # Grid offset accounts for start node space
        grid_offset_x = (DEFAULTS["startNodeSize"] + 60) if show_start_end else 0
        grid_offset_y = 0
        if not is_horizontal and show_start_end:
            grid_offset_y = DEFAULTS["startNodeSize"] + 60
            grid_offset_x = 0

        all_shapes = []
        all_lines = []
        all_groups = []
        step_main_ids = {}   # map step.id -> mainId for connections
        step_positions = {}  # map step.id -> (x, y) for callout positioning
        max_row = 0
        max_col = 0

        if use_grid:
            # ── Grid Layout Mode ──
            for i, step in enumerate(steps):
                row = step.get("row", 0)
                col = step.get("col", i)
                max_row = max(max_row, row)
                max_col = max(max_col, col)

                step_x, step_y = self._grid_position(
                    row, col, box_w, box_h, sp_x, sp_y, grid_offset_x, grid_offset_y
                )

                box = create_activity_box({
                    **step,
                    "x": step_x,
                    "y": step_y,
                    "color": step.get("color", color),
                })

                all_shapes.extend(box["shapes"])
                all_groups.extend(box["groups"])
                step_main_ids[step["id"]] = box["mainId"]
                step_positions[step["id"]] = (step_x, step_y)
        else:
            # ── Linear Layout Mode (original behavior) ──
            cur_x = DEFAULTS["startX"]
            cur_y = DEFAULTS["startY"]

            if show_start_end:
                if is_horizontal:
                    cur_x += DEFAULTS["startNodeSize"] + 60
                else:
                    cur_y += DEFAULTS["startNodeSize"] + 60

            for i, step in enumerate(steps):
                box = create_activity_box({
                    **step,
                    "x": cur_x,
                    "y": cur_y,
                    "color": step.get("color", color),
                })

                all_shapes.extend(box["shapes"])
                all_groups.extend(box["groups"])
                step_main_ids[step["id"]] = box["mainId"]
                step_positions[step["id"]] = (cur_x, cur_y)

                if is_horizontal:
                    cur_x += box_w + sp_x
                else:
                    cur_y += box_h + sp_y

        # ── Start and End Nodes ──
        start_main_id = None
        end_main_id = None

        if show_start_end and len(steps) > 0:
            node_size = DEFAULTS["startNodeSize"]
            end_node_size = DEFAULTS["endNodeSize"]

            if use_grid and start_node_cfg:
                # Grid-positioned start node
                srow = start_node_cfg.get("row", 0)
                scol = start_node_cfg.get("col", -1)
                sx, sy_base = self._grid_position(
                    srow, scol, box_w, box_h, sp_x, sp_y, grid_offset_x, grid_offset_y
                )
                # Center vertically in the cell
                sy = sy_base + (box_h / 2) - (node_size / 2) + DEFAULTS["bandHeight"]
                sx = sx + (box_w / 2) - (node_size / 2)  # Center horizontally too
            elif is_horizontal:
                sx = DEFAULTS["startX"]
                sy = DEFAULTS["startY"] + (box_h / 2) - (node_size / 2) + DEFAULTS["bandHeight"]
            else:
                sx = DEFAULTS["startX"] + (box_w / 2) - (node_size / 2)
                sy = DEFAULTS["startY"]

            start = create_start_node("start", sx, sy)
            all_shapes.extend(start["shapes"])
            all_groups.extend(start["groups"])
            start_main_id = start["mainId"]

            if use_grid and end_node_cfg:
                # Grid-positioned end node
                erow = end_node_cfg.get("row", 0)
                ecol = end_node_cfg.get("col", max_col + 1)
                ex, ey_base = self._grid_position(
                    erow, ecol, box_w, box_h, sp_x, sp_y, grid_offset_x, grid_offset_y
                )
                ey = ey_base + (box_h / 2) - (end_node_size / 2) + DEFAULTS["bandHeight"]
                ex = ex + (box_w / 2) - (end_node_size / 2)
            elif is_horizontal:
                if use_grid:
                    ex_base, ey_base = self._grid_position(
                        0, max_col + 1, box_w, box_h, sp_x, sp_y, grid_offset_x, grid_offset_y
                    )
                    ex = ex_base + (box_w / 2) - (end_node_size / 2)
                    ey = ey_base + (box_h / 2) - (end_node_size / 2) + DEFAULTS["bandHeight"]
                else:
                    ex = cur_x
                    ey = DEFAULTS["startY"] + (box_h / 2) - (end_node_size / 2) + DEFAULTS["bandHeight"]
            else:
                ex = DEFAULTS["startX"] + (box_w / 2) - (end_node_size / 2)
                ey = cur_y if not use_grid else (
                    DEFAULTS["startY"] + grid_offset_y + (max_row + 1) * (box_h + sp_y)
                )

            end = create_end_node("end", ex, ey)
            all_shapes.extend(end["shapes"])
            all_groups.extend(end["groups"])
            end_main_id = end["mainId"]

        # ── Start/End node connections (always added) ──
        if len(steps) > 0:
            from_pos = {"x": 1, "y": 0.5} if is_horizontal else {"x": 0.5, "y": 1}
            to_pos = {"x": 0, "y": 0.5} if is_horizontal else {"x": 0.5, "y": 0}

            # Start -> first step (always)
            if start_main_id:
                all_lines.append(create_connection({
                    "id": _uid("line"),
                    "from": start_main_id,
                    "to": step_main_ids[steps[0]["id"]],
                    "fromPosition": from_pos,
                    "toPosition": to_pos,
                }))

            # Last step -> end (always)
            if end_main_id:
                all_lines.append(create_connection({
                    "id": _uid("line"),
                    "from": step_main_ids[steps[-1]["id"]],
                    "to": end_main_id,
                    "fromPosition": from_pos,
                    "toPosition": to_pos,
                }))

        # ── Auto-connect steps in sequence ──
        if auto_connect and len(steps) > 1:
            from_pos = {"x": 1, "y": 0.5} if is_horizontal else {"x": 0.5, "y": 1}
            to_pos = {"x": 0, "y": 0.5} if is_horizontal else {"x": 0.5, "y": 0}

            for i in range(len(steps) - 1):
                all_lines.append(create_connection({
                    "id": _uid("line"),
                    "from": step_main_ids[steps[i]["id"]],
                    "to": step_main_ids[steps[i + 1]["id"]],
                    "fromPosition": from_pos,
                    "toPosition": to_pos,
                }))

        # ── Explicit connections (overrides, branches, etc.) ──
        for conn in connections:
            from_main_id = step_main_ids.get(conn.get("from"), conn.get("from"))
            to_main_id = step_main_ids.get(conn.get("to"), conn.get("to"))
            conn_from_pos = conn.get("fromPosition", {"x": 1, "y": 0.5} if is_horizontal else {"x": 0.5, "y": 1})
            conn_to_pos = conn.get("toPosition", {"x": 0, "y": 0.5} if is_horizontal else {"x": 0.5, "y": 0})

            all_lines.append(create_connection({
                "id": conn.get("id", _uid("conn")),
                "from": from_main_id,
                "to": to_main_id,
                "label": conn.get("label", ""),
                "lineType": conn.get("lineType", "elbow"),
                "fromPosition": conn_from_pos,
                "toPosition": conn_to_pos,
            }))

        # ── Callout annotations ──
        callouts = self.config.get("callouts", [])
        callout_offsets = {}  # per-step Y offset to stack multiple callouts
        for callout in callouts:
            # Support both string shorthand and object format
            if isinstance(callout, str):
                callout_text = callout
                target_step_id = steps[-1]["id"] if steps else None
                callout_color = None
            else:
                callout_text = callout.get("text", "")
                target_step_id = callout.get("stepId", callout.get("attachTo", steps[-1]["id"] if steps else None))
                callout_color = callout.get("color", None)

            if not target_step_id or target_step_id not in step_main_ids:
                continue

            target_main_id = step_main_ids[target_step_id]
            step_x, step_y = step_positions[target_step_id]

            callout_id = _uid("callout")
            callout_line_id = _uid("callout_line")

            # Auto-size callout to fit text if no explicit dimensions given
            explicit_w = callout.get("width") if isinstance(callout, dict) else None
            explicit_h = callout.get("height") if isinstance(callout, dict) else None
            if explicit_w:
                callout_w = explicit_w
            else:
                # ~6px per char at 9pt, min 200, max box_w
                callout_w = max(200, min(box_w, len(callout_text) * 6 + 30))
            if explicit_h:
                callout_h = explicit_h
            else:
                # Estimate lines: ~7px per char at 9pt, 24px line height, 30px padding
                # +1 buffer line to account for word-wrap breaking earlier than raw char count
                chars_per_line = max(1, callout_w // 7)
                num_lines = max(1, -(-len(callout_text) // chars_per_line)) + 1  # ceil division + buffer
                callout_h = max(50, num_lines * 24 + 30)

            # Stack offset for multiple callouts on same step
            y_extra = callout_offsets.get(target_step_id, 0)

            # Determine callout fill and stroke colors
            fill_color = callout_color or "#FFF9E6"
            stroke_color = _darken_color(fill_color, 0.15) if callout_color else "#E6C200"

            if is_horizontal:
                # Position callout below the target step
                callout_x = step_x + (box_w - callout_w) / 2
                callout_y = step_y + box_h + 30 + y_extra
            else:
                # Position callout to the right of the target step
                callout_x = step_x + box_w + 40
                callout_y = step_y + (box_h - callout_h) / 2 + y_extra

            all_shapes.append({
                "id": callout_id,
                "type": "rectangle",
                "boundingBox": {"x": callout_x, "y": callout_y, "w": callout_w, "h": callout_h},
                "text": (
                    f'<div style="font-size:9pt;text-align:left;'
                    f"font-family:'Open Sans',Arial,sans-serif;color:#495057\">"
                    f"{callout_text}</div>"
                ),
                "style": {
                    "fill": {"type": "color", "color": fill_color},
                    "stroke": {"color": stroke_color, "width": 1, "style": "solid"},
                    "rounding": 6,
                },
            })

            # Connect callout to the target step with a dashed line
            c_from_pos = {"x": 0.5, "y": 0} if is_horizontal else {"x": 0, "y": 0.5}
            c_to_pos = {"x": 0.5, "y": 1} if is_horizontal else {"x": 1, "y": 0.5}
            all_lines.append({
                "id": callout_line_id,
                "lineType": "straight",
                "endpoint1": {
                    "type": "shapeEndpoint",
                    "style": "none",
                    "shapeId": callout_id,
                    "position": c_from_pos,
                },
                "endpoint2": {
                    "type": "shapeEndpoint",
                    "style": "none",
                    "shapeId": target_main_id,
                    "position": c_to_pos,
                },
                "stroke": {
                    "color": stroke_color,
                    "width": 1,
                    "style": "dashed",
                },
            })

            # Track offset for stacking
            callout_offsets[target_step_id] = y_extra + callout_h + 15

        # ── Determine page size ──
        if use_grid:
            page_width = max(1200, DEFAULTS["startX"] + grid_offset_x + (max_col + 2) * (box_w + sp_x) + 200)
            page_height = max(800, DEFAULTS["startY"] + grid_offset_y + (max_row + 1) * (box_h + sp_y) + 200)
            # Expand for callouts below bottom row
            if callouts:
                max_callout_y = max(
                    (step_positions[c.get("stepId", c.get("attachTo", "")) if isinstance(c, dict) else ""][1]
                     if isinstance(c, dict) and (c.get("stepId") or c.get("attachTo")) in step_positions
                     else 0)
                    for c in callouts
                ) if callouts else 0
                total_callout_extra = max(callout_offsets.values()) if callout_offsets else 0
                page_height = max(page_height, max_callout_y + box_h + 30 + total_callout_extra + 100)
        else:
            if is_horizontal:
                page_width = max(1200, cur_x + 200)
                page_height = max(600, box_h + 300)
            else:
                page_width = max(800, box_w + 400)
                page_height = max(800, cur_y + 200)
            if callout_offsets:
                total_callout_extra = max(callout_offsets.values()) if callout_offsets else 0
                if is_horizontal:
                    page_height = max(page_height, DEFAULTS["startY"] + box_h + 30 + total_callout_extra + 80)
                else:
                    page_width = max(page_width, DEFAULTS["startX"] + box_w + 40 + 260 + 100)

        # Validate all shape types before returning
        validate_shapes(all_shapes)

        return {
            "version": 1,
            "pages": [{
                "id": "page1",
                "title": title,
                "settings": {
                    "size": {"type": "custom", "w": page_width, "h": page_height},
                },
                "shapes": all_shapes,
                "lines": all_lines,
                "groups": all_groups,
            }],
        }


# ─── Config → document.json ──────────────────────────────────────────────────

def _as_list(value):
    """Accept a JSON-encoded string OR an already-parsed list. Return a list."""
    if value is None or value == "":
        return []
    if isinstance(value, str):
        return json.loads(value)
    return value


def _as_obj(value):
    """Accept a JSON-encoded string OR an already-parsed dict. Return dict or None."""
    if value is None or value == "":
        return None
    if isinstance(value, str):
        return json.loads(value)
    return value


def build_document(config):
    """Turn a high-level UPN config into a Standard Import document.json dict.

    Mirrors the mapping the Plaito create_upn_diagram tool applied before calling
    UPNBuilder, so configs are drop-in compatible.
    """
    steps = _as_list(config.get("steps"))
    if not steps:
        raise ValueError("At least one process step is required (config.steps is empty).")

    connections = _as_list(config.get("connections"))
    callouts = _as_list(config.get("callouts"))
    start_node_cfg = _as_obj(config.get("startNode"))
    end_node_cfg = _as_obj(config.get("endNode"))

    # If connections are provided, disable autoConnect so the explicit ones are used
    auto_connect = len(connections) == 0

    builder_config = {
        "title": config.get("title", "UPN Process Diagram"),
        "layout": config.get("direction", "horizontal"),
        "color": config.get("process_area", DEFAULTS["defaultColor"]),
        "showStartEnd": config.get("showStartEnd", True),
        "autoConnect": auto_connect,
        "steps": steps,
        "connections": connections,
        "callouts": callouts,
    }
    if start_node_cfg:
        builder_config["startNode"] = start_node_cfg
    if end_node_cfg:
        builder_config["endNode"] = end_node_cfg

    return UPNBuilder(builder_config).build()


def write_lucid_package(document_json, path):
    """Write a .lucid Standard Import package (a ZIP containing document.json)."""
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("document.json", json.dumps(document_json))
    with open(path, "wb") as f:
        f.write(buffer.getvalue())


# ─── CLI ─────────────────────────────────────────────────────────────────────

def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Build a Plative-branded UPN diagram as Lucid Standard Import JSON."
    )
    parser.add_argument(
        "config",
        help="Path to the UPN config JSON, or '-' to read from stdin.",
    )
    parser.add_argument(
        "-o", "--output",
        help="Write document.json here instead of stdout.",
    )
    parser.add_argument(
        "--lucid",
        metavar="PATH",
        help="Also write an importable .lucid package (ZIP) to PATH (fallback path).",
    )
    parser.add_argument(
        "--strip-groups",
        action="store_true",
        help="Omit the page-level 'groups' array from the output. Use only if the "
             "Lucid connector rejects the payload over an unexpected 'groups' field.",
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        help="Pretty-print the JSON (default is compact, which keeps under the 2MB limit).",
    )
    args = parser.parse_args(argv)

    # Load config
    if args.config == "-":
        raw = sys.stdin.read()
    else:
        with open(args.config, "r") as f:
            raw = f.read()
    try:
        config = json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"Error: config is not valid JSON — {e}", file=sys.stderr)
        return 1

    try:
        document = build_document(config)
    except (ValueError, KeyError) as e:
        print(f"Error building UPN document: {e}", file=sys.stderr)
        return 1

    if args.strip_groups:
        for page in document.get("pages", []):
            page.pop("groups", None)

    # A .lucid package (native import) keeps groups; build it before any stripping
    # would matter — here it simply mirrors `document` as emitted.
    if args.lucid:
        write_lucid_package(document, args.lucid)
        print(f"Wrote .lucid package: {args.lucid}", file=sys.stderr)

    text = json.dumps(document, indent=2 if args.pretty else None)

    if args.output:
        with open(args.output, "w") as f:
            f.write(text)
        print(f"Wrote document.json: {args.output}", file=sys.stderr)
    else:
        sys.stdout.write(text)
        sys.stdout.write("\n")

    # Emit a tiny summary to stderr so the caller can sanity-check without parsing stdout
    page = document["pages"][0]
    print(
        f"OK: {len(page['shapes'])} shapes, {len(page['lines'])} lines, "
        f"page {int(page['settings']['size']['w'])}x{int(page['settings']['size']['h'])}",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
