/**
 * Example: build a full deck exercising every helper.
 * Run: node example.js
 */

const h = require('./lib/slideHelpers');

async function main() {
  const pres = h.createPresentation();

  // 1. Title
  h.addTitleSlide(pres, {
    title: 'Q1 2026 Business Review',
    subtitle: 'Leadership readout',
    date: 'April 24, 2026',
  });

  // 2. Agenda
  h.addAgendaSlide(pres, {
    items: [
      'Engagement summary',
      'Key findings from discovery',
      'Recommended path forward',
      'Implementation roadmap',
      'Investment and ROI',
      'Risks and mitigations',
      'Next steps',
    ],
    pageNum: 2,
  });

  // 3. Three boxes
  h.addThreeBoxSlide(pres, {
    title: 'Engagement Pillars',
    boxes: [
      { header: 'Discovery',      body: 'Stakeholder interviews, current-state audit, and process mapping to ground recommendations in evidence.' },
      { header: 'Design',         body: 'Target architecture, data model, and user experience patterns tailored to the business.' },
      { header: 'Delivery',       body: 'Iterative build sprints with continuous stakeholder review and hands-on enablement.' },
    ],
    pageNum: 3,
  });

  // 4. Findings
  h.addFindingsSlide(pres, {
    title: 'Marketing Cloud Discovery Findings',
    whatWeHeard: [
      'Client needs a scalable solution to optimize marketing communications and simplify operations.',
      'Unifying data from different sources is critical for effective marketing campaigns.',
    ],
    recommendations: [
      'Implement Marketing Cloud Engagement to replace Acoustic and unify the comms stack.',
      'Build a complete customer profile using SF Data Cloud as the single source of truth.',
    ],
    impacts: [
      { direction: 'up',   text: 'Enhance customer experience' },
      { direction: 'down', text: 'Reduce operational complexity' },
      { direction: 'up',   text: 'Track campaign ROI / attribution' },
    ],
    pageNum: 4,
  });

  // 5. Section divider dark
  h.addSectionDividerDark(pres, {
    title: 'Recommendations',
    subtitle: 'SECTION 02',
    pageNum: 5,
  });

  // 6. Table
  h.addTableSlide(pres, {
    title: 'Phased Investment',
    subtitle: 'Three waves over twelve months',
    columns: ['Phase', 'Scope', 'Duration', 'Investment'],
    rows: [
      ['Phase 1', 'Foundation: Data Cloud + Marketing Cloud setup', '3 months', '$420K'],
      ['Phase 2', 'Journey build-out + Acoustic migration',         '4 months', '$510K'],
      ['Phase 3', 'Optimization + attribution modeling',            '5 months', '$380K'],
    ],
    pageNum: 6,
  });

  // 7. Section landscape (mountains variant)
  h.addSectionDividerLandscape(pres, {
    title: 'Implementation Roadmap',
    subtitle: 'SECTION 03',
    variant: 'mountains',
    pageNum: 7,
  });

  // 7b. Section landscape (lake variant)
  h.addSectionDividerLandscape(pres, {
    title: 'Risks and Mitigations',
    subtitle: 'SECTION 04',
    variant: 'lake',
    pageNum: 8,
  });

  // 8. Closing
  h.addClosingSlide(pres, { closingText: 'Thank you' });

  await pres.writeFile({ fileName: 'example-deck.pptx' });
  console.log('Wrote example-deck.pptx');
}

main().catch((e) => { console.error(e); process.exit(1); });
