# MKT-09 RoundTable Chapter Meeting Operating Slice

Status: v0 runnable slice
Workflow: `MKT-09 Event & Webinar Marketing`
Last updated: 2026-06-04

## Purpose

This slice makes the first Bootstrapper Capital / Independence Chapter event
lane runnable without turning a future platform, paid funnel tool, or temporary
campaign system into the agency backbone.

The current event format is the RoundTable Chapter meeting. These meetings are
already scheduled in Ownable OS. Attendance is free. Paid membership may become
a downstream offer later, but it is not required for this event lane.

## Operating Position

| Item | Current Decision |
| --- | --- |
| Event type | RoundTable Chapter meeting |
| Event owner | Robert |
| Logistics support | Marcus / agent support as available |
| Event schedule | Existing schedule in Ownable OS |
| Entry cost | Free |
| Downstream offer | Membership may incur a fee later; diagnostic, workshop, or consulting follow-up may be offered only after fit is clear |
| Primary source paths | Book, LinkedIn content, Reach outreach, Apollo drip when credits are available, referrals, community, partner mentions |
| Current RSVP / response path | Existing Google Drive / Business-Systems Audit / assessment response path, pending confirmation |
| Current tracker posture | One CRM-lite bridge or event tracker row per serious attendee or respondent |

## Minimum Workflow

1. Confirm the next RoundTable Chapter meeting in Ownable OS.
2. Choose the invitation source for the meeting.
3. Send invite through the active source path.
4. Capture the response through the existing assessment/form path when possible.
5. If a person downloads the assessment but does not submit a form, track only
   the signal available from the sending platform.
6. Before the event, update attendee status.
7. After the event, send the correct follow-up.
8. Update the CRM-lite bridge with event and next-step fields.
9. Hand off qualified interest to Sales or nurture.
10. Hand off proof, referral, or community signals only after review.

## Tracking Fields

Use these fields in the event tracker or CRM-lite bridge. If the active tool
cannot support all fields, keep the field list as the import/export standard.

| Field | Purpose |
| --- | --- |
| Contact name | Human-readable contact identity |
| Email | Follow-up and dedupe |
| Organization | Fit and context |
| Source | Book, LinkedIn, Reach, Apollo, referral, community, partner, manual |
| Event name | Specific RoundTable / chapter meeting |
| Event date | Event occurrence |
| Event status | Invited, registered, attended, no-show, canceled |
| Assessment status | Downloaded, started, submitted, not applicable, unknown |
| Assessment response link | Link to Google response or related record |
| Interest signal | Workflow pain, founder signal, bootstrapper identity, Ownable OS interest, other |
| Follow-up lane | Nurture, diagnostic, workshop, consulting, membership, no follow-up |
| Owner | Robert, Marcus, account manager, agent |
| Next step | Plain-language next action |
| Follow-up date | Date next action is due |
| Consent / permission note | Any stated permission boundary for follow-up or public proof |
| Paid handoff needed | Yes / no |
| SKU / offer code | Required only if a paid follow-up is created |

## Source And Channel Notes

### Google Drive / Assessment

If the existing assessment is a Google Form, submitted responses should be
available in the linked Google response sheet. This needs confirmation in the
live Google Drive account before the workflow is marked stable.

If the active Independence Chapter audit source is the Business-Systems Audit
Google Sheet, use `docs/operations/independence-chapter-business-systems-audit-capture-plan.md`
as the capture design. The audit workbook should gain a durable results log or
connected form before it is treated as a reliable MKT-09 follow-up source.

Assessment downloads are different from assessment submissions. A download can
only be tracked if the distribution channel exposes the signal, such as a
tracked Apollo link click, email click metric, website analytics event, or a
redirect/download endpoint controlled by URC. For now, do not assume download
tracking exists unless the platform shows it.

### Apollo

Apollo is a source path, not the MKT-09 system of record. If credits are
exhausted, the RoundTable lane can still run through content, manual outreach,
referrals, existing community paths, and the Google response path.

### Affiliate CMO

Affiliate CMO may be used as an ad-copy drafting/reference source because
Robert reports it performs well for direct-response ad copy. It is not the
marketing system of record. Any copy generated or adapted from it must pass
Agent Lab / URC voice, proof, claims, and values review before use.

## Handoffs

| From | To | Trigger / Signal | Handoff Instruction |
| --- | --- | --- | --- |
| `MKT-09` | `MKT-01` | New respondent, attendee, or strong event interest | Create or update the lead row with source, event, status, interest signal, owner, next step, and follow-up date. |
| `MKT-09` | `MKT-02` | Registered, attended, no-show, or post-event nurture needed | Enroll in the correct follow-up lane; stop if the person opts out, becomes sales-ready, or is not a fit. |
| `MKT-09` | `SAL-01` | Attendee asks about paid help, diagnostic, workshop, or consulting | Prepare proposal/diagnostic context from the event row and assessment response. |
| `MKT-09` | `FIN-03` | A paid follow-up, membership, workshop, or invoiceable engagement is created | Add SKU/offer code, amount, payment status, and invoice/receipt need to the owned finance tracker. |
| `MKT-09` | `MKT-04` | Attendee offers testimonial, referral, or story | Confirm permission and claim safety before using the proof. |
| `MKT-09` | `AFC-04` | Attendee becomes a community member or needs ongoing community engagement | Update member/community status and next community action. |

## Responsibilities

| Stage | Primary Owner | Support Owner | Review Point |
| --- | --- | --- | --- |
| Event schedule confirmation | Robert | Agent | Meeting exists in Ownable OS and is safe to promote |
| Invite setup | Robert / Marcus | Agent | Message, audience, and CTA are aligned |
| RSVP / response tracking | Marcus / agent | Robert | Response path and tracker fields are usable |
| Event delivery | Robert | Marcus | Event remains free and aligned to chapter purpose |
| Follow-up | Marcus / agent | Robert | Right lane selected: nurture, diagnostic, workshop, consulting, membership, or no follow-up |
| Finance handoff | Robert | Finance / agent | Paid follow-up has SKU, status, and tracker entry |
| Proof/community handoff | Robert | Marcus / agent | Permission, claim safety, and community status confirmed |

## Zapier / Google Drive Note

A second free two-step Zap can help with one narrow second-stage action, but it
is unlikely to complete the whole client-folder packet population workflow if
multiple files, permissions, or conditional folder structures are required.

Recommended stopgap:

1. Zap 1: signed proposal or intake event creates the Google Drive client folder.
2. Zap 2: new folder or new tracker row creates one next required artifact,
   sends one notification, or adds one tracker update.

Recommended durable path:

- Use a small Google Apps Script or other owned automation to copy the full
  packet, apply naming rules, set sharing, and write back status to the tracker.

The second Zap is useful if it reduces one manual step today. It should not be
treated as the final packet automation until tested against a real folder.

## Open Checks

- Confirm the existing Google assessment form and linked response sheet.
- Confirm whether Apollo exposes link-click or attachment/download signals for
  the assessment in the current drip setup.
- Decide whether the first event tracker lives as a Google Sheet, existing
  CRM-lite bridge, or repo-tracked CSV until the registry app exists.
- Define the exact post-event follow-up messages for attended, no-show,
  registered-but-canceled, and assessment-only contacts.

## Pass Criteria

`MKT-09` can move from shell to runnable when:

- the next Ownable OS RoundTable meeting can be promoted from one invite path
- responses land in one known tracker path
- attendees can be marked invited, registered, attended, no-show, or canceled
- follow-up lane and owner are assigned
- finance handoff is defined for any paid follow-up
- proof/referral and community handoffs are reviewed before use
