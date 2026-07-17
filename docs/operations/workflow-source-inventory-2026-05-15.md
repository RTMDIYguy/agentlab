# Workflow Source Inventory

Date created: 2026-05-15

This inventory records where repo-imported workflow artifacts came from. Do not import `Keys`, raw credential files, archive dumps, or temporary extraction folders without a separate review.

## Track Definitions

- `urc_internal`: URC-specific documents, trackers, and operating artifacts. These may include real roles, tools, pipeline assumptions, or internal naming.
- `client_facing`: reusable client templates housed in each department's `/Workflows` and `/Automations` folders. These need a separate scrub pass before being presented as client-safe packages.
- `automation_scaffold`: blueprint JSON or automation templates that may support either track but still require credential and placeholder review.

This import pass mainly stages `urc_internal` source plus `automation_scaffold` files. The department `/Workflows` folders still need a client-facing import pass.

## Imported This Pass

| Workflow | Repo Folder | Track Imported | Source Types |
| --- | --- | --- | --- |
| OPS-01 | `workflows/ops-01-vision-purpose/` | client_facing scaffold + automation_scaffold | assets/csv, automation blueprint, tracker template |
| OPS-02 | `workflows/ops-02-mission-governance/` | client_facing scaffold + automation_scaffold | assets/csv, automation blueprint, tracker template |
| OPS-03 | `workflows/ops-03-documentation-sop-standards/` | client_facing scaffold + automation_scaffold | assets/csv, automation blueprint, tracker template |
| OPS-04 | `workflows/ops-04-organization-security/` | client_facing scaffold + automation_scaffold | assets/csv, automation blueprint, tracker template |
| OPS-05 | `workflows/ops-05-strategy-planning/` | client_facing scaffold + automation_scaffold | assets/csv, automation blueprint, tracker template |
| OPS-06 | `workflows/ops-06-tech-it/` | client_facing scaffold + automation_scaffold | assets/csv, automation blueprint, tracker template |
| OPS-07 | `workflows/ops-07-growth-training/` | client_facing scaffold + automation_scaffold | assets/csv, automation blueprint, tracker template |
| OPS-08 | `workflows/ops-08-r-d-quality-assurance/` | client_facing scaffold + automation_scaffold | assets/csv, automation blueprint, tracker template |
| CUL-01 | `workflows/cul-01-vision-purpose/` | urc_internal + automation_scaffold | docx text extraction, automation blueprint, tracker template |
| CUL-02 | `workflows/cul-02-mission-governance/` | urc_internal + automation_scaffold | automation blueprint |
| CUL-03 | `workflows/cul-03-documentation-sop/` | urc_internal + automation_scaffold | automation blueprint, tracker template |
| CUL-04 | `workflows/cul-04-organization-security/` | urc_internal + automation_scaffold | docx text extraction, automation blueprint |
| CUL-05 | `workflows/cul-05-growth-training/` | urc_internal + automation_scaffold | docx text extraction, automation blueprint, tracker template |
| CUL-06 | `workflows/cul-06-r-d-quality-assurance/` | urc_internal + automation_scaffold | docx text extraction, automation blueprint, tracker template |
| CUL-07 | `workflows/cul-07-strategy-planning/` | urc_internal + automation_scaffold | tracker template |
| CUL-08 | `workflows/cul-08-tech-and-it/` | urc_internal + automation_scaffold | tracker template |
| FIN-01 | `workflows/fin-01-pricing-expenses/` | urc_internal + automation_scaffold | docx text extraction, automation blueprint, tracker template |
| FIN-02 | `workflows/fin-02-taxes-fees/` | urc_internal + automation_scaffold | docx text extraction, automation blueprint, tracker template |
| FIN-03 | `workflows/fin-03-accounts-receivable-payable/` | urc_internal + automation_scaffold | docx text extraction, automation blueprint, tracker template |
| FIN-04 | `workflows/fin-04-accounting-auditing/` | urc_internal + automation_scaffold | docx text extraction, automation blueprint, tracker template |
| FIN-05 | `workflows/fin-05-investment-savings/` | urc_internal + automation_scaffold | docx text extraction, automation blueprint, tracker template |
| SAL-01 | `workflows/sal-01-proposals-contracts/` | urc_internal + automation_scaffold | docx text extraction, assets/csv, automation blueprint, tracker template |
| SAL-02 | `workflows/sal-02-onboarding/` | urc_internal + automation_scaffold | docx text extraction, assets/csv, automation blueprint, tracker template |
| SAL-03 | `workflows/sal-03-deals-discounts/` | urc_internal + automation_scaffold | docx text extraction, assets/csv, automation blueprint, tracker template |
| SAL-04 | `workflows/sal-04-negotiating-closing/` | urc_internal + automation_scaffold | docx text extraction, assets/csv, automation blueprint, tracker template |
| SAL-05 | `workflows/sal-05-passive-active-income-streams/` | urc_internal + automation_scaffold | docx text extraction, assets/csv, automation blueprint, tracker template |
| SAL-06 | `workflows/sal-06-fund-raising/` | urc_internal + automation_scaffold | docx text extraction, assets/csv, automation blueprint, tracker template |
| MKT-01 | `workflows/mkt-01-lead-generation-conversion/` | urc_internal + automation_scaffold | docx text extraction, assets/csv, automation blueprint, tracker template |
| MKT-02 | `workflows/mkt-02-email-sms-nurture/` | urc_internal + automation_scaffold | docx text extraction, assets/csv, automation blueprint, tracker template |
| MKT-03 | `workflows/mkt-03-polls-assessments/` | urc_internal + automation_scaffold | docx text extraction, assets/csv, automation blueprint, tracker template |
| MKT-04 | `workflows/mkt-04-reviews-referrals/` | urc_internal + automation_scaffold | docx text extraction, assets/csv, automation blueprint, tracker template |
| MKT-05 | `workflows/mkt-05-outreach-engagement/` | urc_internal + automation_scaffold | docx text extraction, assets/csv, automation blueprint, tracker template |
| MKT-06 | `workflows/mkt-06-content-creation-dissemination/` | urc_internal + automation_scaffold | docx text extraction, assets/csv, automation blueprint, tracker template |
| MKT-07 | `workflows/mkt-07-paid-advertising-ppc/` | urc_internal + automation_scaffold | automation blueprint, tracker template |
| MKT-08 | `workflows/mkt-08-social-media-management/` | automation_scaffold | automation blueprint |
| MKT-09 | `workflows/mkt-09-event-webinar-marketing/` | folder shell only | folder shell only |
| FUL-01 | `workflows/ful-01-display-packaging/` | urc_internal + automation_scaffold | docx text extraction, automation blueprint, tracker template |
| FUL-02 | `workflows/ful-02-client-success/` | urc_internal + automation_scaffold | docx text extraction, automation blueprint, tracker template |
| FUL-03 | `workflows/ful-03-customer-service/` | urc_internal + automation_scaffold | docx text extraction, automation blueprint, tracker template |
| FUL-04 | `workflows/ful-04-feedback-testimonials/` | urc_internal + automation_scaffold | docx text extraction, automation blueprint, tracker template |
| FUL-05 | `workflows/ful-05-analytics-measurement/` | urc_internal + automation_scaffold | docx text extraction, automation blueprint, tracker template |
| AFC-01 | `workflows/afc-01-subscriptions/` | urc_internal + automation_scaffold | docx text extraction, automation blueprint, tracker template |
| AFC-02 | `workflows/afc-02-memberships/` | urc_internal + automation_scaffold | docx text extraction, automation blueprint, tracker template |
| AFC-03 | `workflows/afc-03-long-term-contracts/` | urc_internal + automation_scaffold | docx text extraction, automation blueprint, tracker template |
| AFC-04 | `workflows/afc-04-communities/` | urc_internal + automation_scaffold | docx text extraction, automation blueprint, tracker template |

## Notes

- MKT-06 remains the certified active package at `mkt-06-content-creation-dissemination/`; the `workflows/mkt-06-*` folder is a source-import mirror for the complete registry.
- Some departments only had department-level source documents, so those text extractions are repeated in each matching workflow folder until a per-workflow kit is created.
- MKT-08 now has an automation scaffold, but still does not have a clean matching source artifact from the archive pass.
- MKT-09 did not have a clean matching source artifact or automation blueprint in the archive pass and is currently a folder shell.

## Automation JSON Inventory

These department `/Automations` JSON files are staged in this import pass.

| Source `/Automations` file | Repo destination |
| --- | --- |
| `AfterCare Department\Automations\AFC01-Blueprint.json` | `workflows\afc-01-subscriptions\automation\AFC01-Blueprint.json` |
| `AfterCare Department\Automations\AFC02-Blueprint.json` | `workflows\afc-02-memberships\automation\AFC02-Blueprint.json` |
| `AfterCare Department\Automations\AFC03-Blueprint.json` | `workflows\afc-03-long-term-contracts\automation\AFC03-Blueprint.json` |
| `AfterCare Department\Automations\AFC04-Blueprint.json` | `workflows\afc-04-communities\automation\AFC04-Blueprint.json` |
| `Culture\Automations\CUL01-Blueprint.json` | `workflows\cul-01-vision-purpose\automation\CUL01-Blueprint.json` |
| `Culture\Automations\CUL02-Blueprint.json` | `workflows\cul-02-mission-governance\automation\CUL02-Blueprint.json` |
| `Culture\Automations\CUL03-Blueprint.json` | `workflows\cul-03-documentation-sop\automation\CUL03-Blueprint.json` |
| `Culture\Automations\CUL04-Blueprint.json` | `workflows\cul-04-organization-security\automation\CUL04-Blueprint.json` |
| `Culture\Automations\CUL05-Blueprint.json` | `workflows\cul-05-growth-training\automation\CUL05-Blueprint.json` |
| `Culture\Automations\CUL06-Blueprint.json` | `workflows\cul-06-r-d-quality-assurance\automation\CUL06-Blueprint.json` |
| `Marketing Department\Automations\MKT01-Lead-Enrichment-Blueprint.json` | `workflows\mkt-01-lead-generation-conversion\automation\MKT01-Lead-Enrichment-Blueprint.json` |
| `Marketing Department\Automations\MKT02-Nurture-Enrollment-Blueprint.json` | `workflows\mkt-02-email-sms-nurture\automation\MKT02-Nurture-Enrollment-Blueprint.json` |
| `Marketing Department\Automations\MKT03-Assessment-Scoring-Blueprint.json` | `workflows\mkt-03-polls-assessments\automation\MKT03-Assessment-Scoring-Blueprint.json` |
| `Marketing Department\Automations\MKT04-Review-Trigger-Blueprint.json` | `workflows\mkt-04-reviews-referrals\automation\MKT04-Review-Trigger-Blueprint.json` |
| `Marketing Department\Automations\MKT05-Outreach-Response-Blueprint.json` | `workflows\mkt-05-outreach-engagement\automation\MKT05-Outreach-Response-Blueprint.json` |
| `Marketing Department\Automations\MKT06-Content-Distribution-Blueprint.json` | `workflows\mkt-06-content-creation-dissemination\automation\MKT06-Content-Distribution-Blueprint.json` |
| `Marketing Department\Automations\MKT07-Paid-Advertising-Blueprint.json` | `workflows\mkt-07-paid-advertising-ppc\automation\MKT07-Paid-Advertising-Blueprint.json` |
| `Marketing Department\Automations\MKT08-Social-Media-Blueprint.json` | `workflows\mkt-08-social-media-management\automation\MKT08-Social-Media-Blueprint.json` |
| `operations Department\Automations\OPS01-Blueprint.json` | `workflows\ops-01-vision-purpose\automation\OPS01-Blueprint.json` |
| `operations Department\Automations\OPS02-Blueprint.json` | `workflows\ops-02-mission-governance\automation\OPS02-Blueprint.json` |
| `operations Department\Automations\OPS03-Blueprint.json` | `workflows\ops-03-documentation-sop-standards\automation\OPS03-Blueprint.json` |
| `operations Department\Automations\OPS04-Blueprint.json` | `workflows\ops-04-organization-security\automation\OPS04-Blueprint.json` |
| `operations Department\Automations\OPS05-Blueprint.json` | `workflows\ops-05-strategy-planning\automation\OPS05-Blueprint.json` |
| `operations Department\Automations\OPS06-Blueprint.json` | `workflows\ops-06-tech-it\automation\OPS06-Blueprint.json` |
| `operations Department\Automations\OPS07-Blueprint.json` | `workflows\ops-07-growth-training\automation\OPS07-Blueprint.json` |
| `operations Department\Automations\OPS08-Blueprint.json` | `workflows\ops-08-r-d-quality-assurance\automation\OPS08-Blueprint.json` |
| `Sales Department\Automations\SALES01-Blueprint.json` | `workflows\sal-01-proposals-contracts\automation\SALES01-Blueprint.json` |
| `Sales Department\Automations\SALES02-Blueprint.json` | `workflows\sal-02-onboarding\automation\SALES02-Blueprint.json` |
| `Sales Department\Automations\SALES03-Blueprint.json` | `workflows\sal-03-deals-discounts\automation\SALES03-Blueprint.json` |
| `Sales Department\Automations\SALES04-Blueprint.json` | `workflows\sal-04-negotiating-closing\automation\SALES04-Blueprint.json` |
| `Sales Department\Automations\SALES05-Blueprint.json` | `workflows\sal-05-passive-active-income-streams\automation\SALES05-Blueprint.json` |
| `Sales Department\Automations\SALES06-Blueprint.json` | `workflows\sal-06-fund-raising\automation\SALES06-Blueprint.json` |
| `Finance Department\Automations\FIN01-Pricing-Expenses-Blueprint.json` | `workflows\fin-01-pricing-expenses\automation\FIN01-Pricing-Expenses-Blueprint.json` |
| `Finance Department\Automations\FIN02-Taxes-Fees-Blueprint.json` | `workflows\fin-02-taxes-fees\automation\FIN02-Taxes-Fees-Blueprint.json` |
| `Finance Department\Automations\FIN03-AR-AP-Blueprint.json` | `workflows\fin-03-accounts-receivable-payable\automation\FIN03-AR-AP-Blueprint.json` |
| `Finance Department\Automations\FIN04-Accounting-Auditing-Blueprint.json` | `workflows\fin-04-accounting-auditing\automation\FIN04-Accounting-Auditing-Blueprint.json` |
| `Finance Department\Automations\FIN05-Investment-Savings-Blueprint.json` | `workflows\fin-05-investment-savings\automation\FIN05-Investment-Savings-Blueprint.json` |
| `Fulfillment Department\Automations\FUL01-Deliverable-Tracking-Blueprint.json` | `workflows\ful-01-display-packaging\automation\FUL01-Deliverable-Tracking-Blueprint.json` |
| `Fulfillment Department\Automations\FUL02-Client-Success-Blueprint.json` | `workflows\ful-02-client-success\automation\FUL02-Client-Success-Blueprint.json` |
| `Fulfillment Department\Automations\FUL03-Customer-Service-Blueprint.json` | `workflows\ful-03-customer-service\automation\FUL03-Customer-Service-Blueprint.json` |
| `Fulfillment Department\Automations\FUL04-Feedback-Testimonials-Blueprint.json` | `workflows\ful-04-feedback-testimonials\automation\FUL04-Feedback-Testimonials-Blueprint.json` |
| `Fulfillment Department\Automations\FUL05-Analytics-Measurement-Blueprint.json` | `workflows\ful-05-analytics-measurement\automation\FUL05-Analytics-Measurement-Blueprint.json` |

No full department remains without `/Automations` JSON after the 2026-05-17 recovery import. MKT-09 is the known individual workflow still missing a clean automation blueprint.

## Next Client-Facing Import Lane

Import and label the department `/Workflows` folders separately. Keep the client-facing files distinct from URC/internal source so later package conversion can produce two variants:

- `kit.md` or `kit.urc.md` for the URC/internal package.
- `kit.client-template.md` for the scrubbed client-facing package.

Known source folders to inspect next:

- `AfterCare Department/Workflows`
- `Culture/Workflows`
- `Finance Department/Workflows`
- `Fulfillment Department/Workflows`
- `Marketing Department/Workflows`
- `operations Department/Workflows`
- `Sales Department/Workflows`
