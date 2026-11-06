---
name: "overburn-pli-followup"
description: "Monitor Joel's delivery portfolio (Director = Joel Salazar) for budget risk such as line items over 100% or overburn, then send each PM one budget risk report for their projects in Slack."
---

# Overburn and Budget Risk Follow-Up

Goal: catch budget risk early so PMs talk to the customer before an overrun becomes a surprise. Scans every active project where Joel Salazar is Director, flags risk, checks whether the customer already knows, sends each Project Manager (PM) one short budget risk report covering their flagged projects, and closes the loop on replies. Details live in Metis; the report stays high level. Delivery Managers (DMs) receive nothing. Data matches the Metis Delivery Portfolio dashboard (calibrated 2026-10-22). Budget End State already includes timeline and forecast, so no separate timeline or forecast rules are needed. Budget is managed at the overall level, so one line item over 100% is a flag to discuss, not an automatic crisis.

## Where Output Goes
Digests, PM report drafts, confirmations and loop summaries post to the private Slack channel #budget-management-monitor (channel ID C0CBD6X1Y9Y). The channel gets one top-level message per run; everything else goes in that message's thread. Approved reports go to each PM as a one-to-one DM from Joel's account. All Slack actions run under Joel's account (Slack user UCMQ8EMQF).

## Run Types
- `weekly` (Monday 8:44 AM ET): full scan, PM report drafts, and only the items that need Joel's attention. Sends nothing to PMs.
- `sweep` (weekdays every 2 hours, 9 AM to 5 PM ET, or on demand when Joel says "run the sweep"): sends the PM reports Joel approved. No scan. See Step 11.
- `loop` (Thursday 8:32 AM ET): close the loop only. Read PM replies, propose nudges, escalate. No new scan.

## Mode
- `draft` (current default): PM reports are posted in the digest thread for Joel's reply-based approval. Nothing reaches a PM until Joel approves and a sweep runs. Nudges are proposed in the channel, not posted.
- `send`: the weekly run sends PM reports directly and posts links in the digest thread. Nudges post in the PM's DM thread. Only switch when Joel says so.

## Step 1: Pull Projects (Salesforce Prod MCP, soqlQuery)
```
SELECT Id, Name, Status__c, Project_Lead__r.Name, Delivery_Manager__r.Name,
  Budget_Variance_CUR__c, Budget_Variance_HRS__c,
  Budget_Remaining_Percentage__c, HRS_Budget_Remaining__c,
  Hours_Budget__c, Value_Budget__c, Slack_Channel_Link__c,
  Budget_Notes__c, DM_Comments__c
FROM Project__c
WHERE Director__r.Name = 'Joel Salazar'
  AND Status__c IN ('In Progress','Planned','On Hold','Overdue Invoice')
  AND Name != 'Plative Lift Internal Initiative'
```

## Step 2: Line Items Over 100%
```
SELECT Project__c, Name, PercentComplete__c, Total_Hours_Scheduled__c, Total_Hours_Completed__c, Status__c
FROM Project_Line_Items__c
WHERE Project__r.Director__r.Name = 'Joel Salazar'
  AND Project__r.Status__c IN ('In Progress','Planned','On Hold','Overdue Invoice')
  AND PercentComplete__c > 100 AND Non_billable__c = false
ORDER BY PercentComplete__c DESC
```
Line item Status__c values: Pending, In Progress, On Hold, Completed (some blank). Count every status, including Completed, because a completed item over 100% still consumed budget.

Data hygiene check (every flagged project): billable line items with hours logged but status still Pending.
```
SELECT Project__c, Name, Total_Hours_Completed__c FROM Project_Line_Items__c
WHERE Project__r.Director__r.Name = 'Joel Salazar'
  AND Project__r.Status__c IN ('In Progress','Planned','On Hold','Overdue Invoice')
  AND Status__c = 'Pending' AND Total_Hours_Completed__c > 0 AND Non_billable__c = false
```
Not a flag rule on its own. Mention only for projects already flagged, as a count.

## Step 3: Derive Metrics
- Budget End State: `Budget_Variance_CUR__c > 0` = Overburn, else Underburn.
- Dollar burn % = 100 - Budget_Remaining_Percentage__c. Hours burn % = 100 - HRS_Budget_Remaining__c.

## Step 4: Rules (all High priority; any one triggers)
- A. Any billable line item over 100%, whether or not the overall budget is overburn. Note whether the overall budget can absorb it.
- B. Overall overburn of $5,000 or more, or 25 hours or more.
- C. Hours burning faster than dollars: hours burn exceeds dollar burn by 10+ points, or Budget_Variance_HRS__c > 0 while Budget_Variance_CUR__c <= 0.
- D. Dollars burning faster than hours: dollar burn exceeds hours burn by 10+ points, or Budget_Variance_CUR__c > 0 while Budget_Variance_HRS__c <= 0.
- E. Dollar or hours burn >= 60% while project Status__c = In Progress AND Budget End State is Overburn (Budget_Variance_CUR__c > 0), meaning it is trending to finish over budget.

Skip Planned projects with 0 hours consumed. Rank projects by number of rules tripped.

## Step 5: Customer Awareness Check
For each flagged project:
- Latest tracker: `SELECT As_of_Date__c, Overall__c, Budget__c, Budget_Explanation_of_Color__c, Go_to_Green_Plan__c, Next_Steps__c, Key_Updates__c, Discussion_Topics__c FROM Project_Tracking__c WHERE Project__c = :id ORDER BY As_of_Date__c DESC LIMIT 1`
- Change orders: `SELECT Change_Order_Request_Name__c, Status__c, Client_Approval__c, ClientNotified__c, ClientAware__c, EstimatedHoursNeeded__c, CreatedDate FROM Change_Order_Request__c WHERE Project__c = :id ORDER BY CreatedDate DESC LIMIT 3`
- Budget_Notes__c and DM_Comments__c from Step 1.
- Project Slack channel: take the channel ID from Slack_Channel_Link__c (the part after /archives/). Read the last 21 days with slack_read_channel, and open threads that look relevant with slack_read_thread. Look for messages about budget, hours, overage, burn, change orders, scope, rebaseline, or a conversation with the customer about any of these, including customer pushback. Capture the date and a one-line summary of the most relevant exchange. If the link is blank or the channel cannot be read (Joel is not a member, or it is private), mark it "channel not readable" and continue. Never post in project channels.
Classify each project: customer aware (change order with ClientAware or ClientNotified, or the tracker, notes, comments or project channel describe a budget conversation with the customer), not evidenced, or tracker mismatch (tracker Budget color Green while rules trip, or tracker older than 14 days). Channel evidence is an inference from conversation, so phrase it as "looks like" rather than a fact.

## Step 6: Noise Control and History
Search Slack for Joel's earlier sent DMs titled "Budget risk report" to each PM (last 6 weeks). Include a project in a PM's report only when:
- It is newly flagged (not in any report in the last 6 weeks), OR
- Risk got worse since the last report: more rules tripped, new line items over 100%, or overburn grew by $2,500 or 10 hours or more, OR
- The PM did not reply to the last report that included it (Step 9).
Other flagged projects are left out of this week's output entirely. If none of a PM's projects qualify, draft no report for that PM.

## Step 7: Group by PM and Resolve People
Group qualifying projects by Project_Lead__r.Name. Resolve each PM with slack_search_users. No confident match = "no Slack match": list it under Needs Your Attention and do not send. If the PM is Joel, skip the report and list those projects under Needs Your Attention.

## Step 8: PM Report Template
Plative voice: no em dashes, active voice, short sentences, "customer" not "client", no emojis. Say "dollars", never "value". Ask whether things need updating rather than telling people to update them, since the data or the reading may be wrong. Do not mention Claude or Salesforce in the report. Each project gets a bolded name line, then one bullet per red flag with the key number. Keep bullets short; Metis has the detail.

```
Budget risk report: <date>

Hi <PM first name>, my AI budget monitoring agent flagged <N> of your projects for budget risk. Since this was put together with AI, there may be some inaccuracies, so please correct anything that looks off.

Here are the red flags we are seeing at the moment:

**<Project Name 1>**
- <red flag with key number, e.g. 3 line items over 100%: QA (147%), UAT (128%), CO UAT (388%)>
- <e.g. Trending to finish $9,813 over budget, with 74% of dollars burned>
- <e.g. Hours burning faster than dollars: 84% of hours vs 74% of dollars>
- <customer line, e.g. Looks like the customer was told on Oct 15 in the project channel, or Customer looks aware (change order pending), or No sign the customer has been told yet>
- <only if relevant: Tracker still shows budget as Green. Does it need an update?>
- <only if relevant: 6 line items with hours are still marked Pending. Should their status change?>

**<Project Name 2>**
- <...>

For each project, can you share:
- What is driving it?
- Has the customer been told, or when will you raise it?
- What action is underway (borrowing from other line items, a change order, a scope reset, or a rebaseline), and by when?

Full details are in Metis: https://script.google.com/a/plative.com/macros/s/AKfycby_XOkcQinORLTnafcYff-L1x_jK4xQ3L-XzO0JX6apGkAKyoUkKfL_fCemKyyzXu8DBg/exec?app=project&tab=portfolio
Does the project tracker or Budget Notes need an update to reflect any of this?
```
If every project in the report shows the customer as aware, replace the three questions with: "What is the current status with the customer, and what is the next date?"

## Step 9: Close the Loop (loop runs, and weekly runs for prior weeks)
For each "Budget risk report" DM sent to a PM in the last 3 weeks, read the DM thread and any direct replies after it.
- Reply received: mark projects with action in motion as "action underway". Surface a reply in the digest only if it needs Joel (for example the PM asks for help, disputes the data, or says the customer has not been told and no plan exists).
- No reply after 3 business days: nudge in the PM's DM (in draft mode, propose it in the channel instead): "Following up on the budget risk report. Can you share a quick update?"
- A project in 3 weekly reports in a row with no reply or no action underway: escalate in the digest under "Needs your attention".

## Step 10: Digest (posted to #budget-management-monitor, C0CBD6X1Y9Y)
No portfolio summary, no flagged table, no monitoring list. Post ONE top-level message titled "Overburn Monitor: <date> (<mode>)" with only:
1. Needs Your Attention: one short bullet each for escalations (projects in 3 reports in a row with no reply or no action), reports unanswered after 3 business days with the proposed nudge, PM replies that need Joel, PMs with no Slack match, projects where Joel is the PM, and project channels that could not be read. If nothing qualifies, write "Nothing needs your attention this week."
2. Draft list: "1. <PM> (<N> projects)", "2. ...". In draft mode, end with: "Reports are in this thread. Reply here with send all, send 1, 3, or skip 2."
Then post each PM report draft as a thread reply under the digest, starting with "<n>. <PM name> | <N> projects" followed by the full report text. Never post drafts as separate top-level messages.
In send mode, post links to the sent reports in the thread instead.
Loop runs post a short top-level message titled "Overburn Monitor Loop Check: <date> (<mode>)" with only the items that need Joel: escalations, proposed nudges, and replies that need him. If there is nothing, post one line saying so.

## Step 11: Approval Sweep (reply-based approval)
1. Read C0CBD6X1Y9Y with slack_read_channel. Find the most recent "Overburn Monitor" digest and read its thread with slack_read_thread.
2. Act only on replies from Joel (UCMQ8EMQF) in that thread. Ignore everyone else.
   - "send all": every unsent numbered report is approved.
   - "send <numbers>" (for example "send 1, 3"): those reports are approved.
   - "skip <numbers>": reply "Skipped <numbers>." and do nothing else for them.
3. For each approved report, send the report text (without the "<n>. <PM name> | <N> projects" label line) as a one-to-one DM to that PM with slack_send_message (PM's user ID as channel_id). If no confident Slack match, reply "No Slack match for <PM>, report <n> not sent." and skip.
4. After each send, reply in the digest thread: "Sent report <n> to <PM> at <time ET>."
5. Before acting, check the thread for an existing "Sent report <n>" or "Skipped" reply covering that number. If found, do nothing, so nothing is sent twice.
6. If there are no new approvals, post nothing. Never scan or change rules during a sweep.