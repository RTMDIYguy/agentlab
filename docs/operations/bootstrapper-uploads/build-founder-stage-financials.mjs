import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "docs/operations/bootstrapper-uploads";
const outputPath = `${outputDir}/URC-Agent-Lab-Founder-Stage-Financial-Overview.xlsx`;

await fs.mkdir(outputDir, { recursive: true });

const workbook = Workbook.create();
const cover = workbook.worksheets.add("Cover");
const position = workbook.worksheets.add("Current Position");
const assumptions = workbook.worksheets.add("Assumptions");
const cashflow = workbook.worksheets.add("Cash Flow Projection");
const checks = workbook.worksheets.add("Checks");
const sources = workbook.worksheets.add("Source Notes");

const dark = "#111827";
const teal = "#0F766E";
const lightTeal = "#D9EDE8";
const lightGray = "#F3F4F6";
const yellow = "#FFF2CC";
const redFill = "#FCE4D6";
const greenFill = "#E2F0D9";
const moneyFmt = "$#,##0;[Red]($#,##0);-";
const pctFmt = "0.0%";

function title(sheet, text, subtitle) {
  sheet.getRange("A1:H1").values = [[text, "", "", "", "", "", "", ""]];
  sheet.getRange("A1:H1").format = {
    fill: dark,
    font: { bold: true, color: "#FFFFFF" },
  };
  sheet.getRange("A2:H2").values = [[subtitle, "", "", "", "", "", "", ""]];
  sheet.getRange("A2:H2").format = { fill: lightGray, font: { italic: true, color: "#374151" }, wrapText: true };
}

function setWidths(sheet, widths) {
  widths.forEach((w, idx) => {
    sheet.getRangeByIndexes(0, idx, 1, 1).format.columnWidthPx = w;
  });
}

function header(range) {
  range.format = {
    fill: teal,
    font: { bold: true, color: "#FFFFFF" },
    wrapText: true,
  };
}

function subheader(range) {
  range.format = {
    fill: lightTeal,
    font: { bold: true, color: "#111827" },
    wrapText: true,
  };
}

title(
  cover,
  "URC / Agent Lab Founder-Stage Financial Overview",
  "Prepared 2026-05-24. Management-estimate package for Bootstrapper.ai / Ownable OS setup. Not audited. Not CPA-prepared."
);
setWidths(cover, [220, 140, 160, 160, 160, 160, 160, 160]);
cover.getRange("A4:B12").values = [
  ["Company", "Uncle Robert Consulting LLC / Agent Lab"],
  ["Owner", "Robert T. McCarthy"],
  ["Package scope", "Current financial position summary and 12-month cash flow projection"],
  ["Historical statement status", "Formal P&L and balance sheet pending reconciliation"],
  ["Forecast basis", "Management assumptions derived from current offer ladder and operating notes"],
  ["Currency", "USD"],
  ["Forecast period", "June 2026 through May 2027"],
  ["Use", "Platform setup, planning, founder-stage review"],
  ["Limitation", "Not a substitute for reconciled accounting records, tax filing, investor diligence, or CPA review"],
];
cover.getRange("A4:A12").format = { fill: lightGray, font: { bold: true } };
cover.getRange("B4:B12").format.wrapText = true;
cover.getRange("A14:H14").values = [["Workbook Tabs", "", "", "", "", "", "", ""]];
subheader(cover.getRange("A14:H14"));
cover.getRange("A15:C20").values = [
  ["Cover", "Purpose, scope, and limitations", "Read first"],
  ["Current Position", "Honest summary of what is known vs pending", "Upload-ready narrative"],
  ["Assumptions", "Editable forecast drivers", "Blue/yellow cells should be reviewed"],
  ["Cash Flow Projection", "12-month cash flow forecast", "Formula-driven"],
  ["Checks", "Completeness and formula checks", "Review before sending externally"],
  ["Source Notes", "Where inputs came from", "Audit trail"],
];
header(cover.getRange("A15:C15"));

title(
  position,
  "Current Financial Position Summary",
  "Best available founder-stage position as of 2026-05-24. Amounts are intentionally conservative placeholders until bank, invoice, AR/AP, and owner contribution data are reconciled."
);
setWidths(position, [220, 170, 360, 180, 180, 180]);
position.getRange("A4:F4").values = [["Area", "Current Status", "What We Know", "Evidence / Source", "Next Action", "Confidence"]];
header(position.getRange("A4:F4"));
position.getRange("A5:F15").values = [
  ["Operating stage", "Active", "Founder-led, bootstrapped consulting practice moving into workflow productization and SaaS-enabled delivery.", "Vision and business overview docs", "Continue weekly operating cadence", "High"],
  ["Revenue history", "Pending reconciliation", "Offer/pricing model exists; complete booked revenue history was not found in available finance trackers.", "Finance tracker inspection", "Export bank/Frappe/Stripe/PayPal history", "Medium"],
  ["Cash on hand", "Unknown", "No reconciled bank balance available in workspace search.", "No bank statement located", "Enter current bank/cash balance in Assumptions", "Low"],
  ["Accounts receivable", "Unknown / likely low", "AR/AP tracker exists but appears to be a template or mostly empty, not a reconciled live ledger.", "FIN03_AR_AP_Tracker.xlsx", "Update open invoices and expected collection dates", "Low"],
  ["Accounts payable", "Unknown", "Invoices/files exist, but no complete payable schedule was found.", "Finance root intake files and invoices", "List open bills, due dates, and minimum payments", "Low"],
  ["Debt", "No outside investment documented", "Source docs state zero outside investment and zero debt as of March 2026; should be re-confirmed.", "Vision & Purpose source", "Confirm current liabilities and any credit obligations", "Medium"],
  ["Core finance system", "Defined", "Frappe is the intended finance system of record.", "Operating architecture", "Keep invoice and receivable records centralized", "High"],
  ["Financial controls", "Emerging", "Change-control, finance workflows, and weekly Friday KPI/finance review are defined.", "Governance SOP and FIN workflows", "Run Friday review consistently", "High"],
  ["P&L readiness", "Not ready for formal statement", "Revenue/expense trackers exist but do not yet provide reconciled historical actuals.", "Tracker inspection", "Reconcile bank, invoices, receipts, software spend", "Medium"],
  ["Balance sheet readiness", "Not ready for formal statement", "Assets/liabilities/equity records are not complete enough for a true balance sheet.", "Workspace finance search", "Prepare opening balance sheet from bank/assets/liabilities", "Low"],
  ["Projection readiness", "Ready with caveats", "Offer ladder and operating cost assumptions are enough for a planning-grade cash flow projection.", "Offer one-pager and operating docs", "Review assumptions before using externally", "Medium"],
];
position.getRange("A5:F15").format.wrapText = true;

title(assumptions, "Forecast Assumptions", "Editable driver sheet. Blue/yellow cells are management inputs and should be reviewed before use.");
setWidths(assumptions, [260, 140, 140, 120, 390]);
assumptions.getRange("A4:E4").values = [["Assumption", "Base Value", "Downside", "Upside", "Notes"]];
header(assumptions.getRange("A4:E4"));
assumptions.getRange("A5:E23").values = [
  ["Starting cash balance", 0, 0, 0, "Placeholder until current bank/cash balance is entered."],
  ["Current known AR collection in Month 1", 0, 0, 0, "Placeholder until open invoices are reconciled."],
  ["Current known AP payment in Month 1", 0, 0, 0, "Placeholder until open bills are reconciled."],
  ["Setup sprint price", 1000, 1000, 1000, "Founder Signal System setup sprint target from offer one-pager."],
  ["Beta subscription price / month", 97, 97, 97, "Founder Signal System beta pricing direction."],
  ["Jumpstart price", 500, 500, 500, "AI Jumpstart price from Vision & Purpose source."],
  ["Growth Pod price", 1500, 1500, 1500, "AI Growth Pod price from Vision & Purpose source."],
  ["Retainer price / month", 1500, 1000, 2000, "Midpoint of $1,000-$2,000 consulting retainer range."],
  ["Monthly baseline tool/admin costs", 225, 150, 350, "Management estimate pending software spend reconciliation."],
  ["Variable delivery cost rate", 0.15, 0.10, 0.25, "Estimated fulfillment/support cost as % of collected revenue."],
  ["Owner draw / survival draw", 0, 0, 0, "Set when Robert decides draw requirement for planning."],
  ["Month 1 setup sprints", 0, 0, 1, "Conservative until active lead flow converts."],
  ["Month 1 active beta subscriptions", 0, 0, 1, "Current beta launch stage assumption."],
  ["Month 1 retainers", 0, 0, 0, "No current active retainer ledger found in workspace."],
  ["Setup sprint growth every 3 months", 1, 0, 1, "Adds capacity/traction in Months 4, 7, and 10 in base/upside."],
  ["Beta subscription adds per month", 1, 0, 2, "Simple linear add assumption after beta launch."],
  ["Retainer adds every 6 months", 1, 0, 1, "Adds a retainer in Month 7 for base/upside."],
  ["Conservative cash runway threshold", 500, 500, 1000, "Threshold used for status flags."],
  ["Scenario used in Cash Flow sheet", "Base", "Downside", "Upside", "Change formulas manually if a scenario-specific model is needed."],
];
assumptions.getRange("A5:E23").format.wrapText = true;
assumptions.getRange("B5:D23").format = { fill: yellow, font: { color: "#0000FF" } };
assumptions.getRange("B5:D11").format.numberFormat = moneyFmt;
assumptions.getRange("B12:D17").format.numberFormat = "0";
assumptions.getRange("B14:D14").format.numberFormat = "0";
assumptions.getRange("B10:D10").format.numberFormat = pctFmt;
assumptions.getRange("B22:D22").format.numberFormat = moneyFmt;

title(cashflow, "12-Month Cash Flow Projection", "Planning-grade forecast using current offer assumptions. Replace placeholders with reconciled actuals when available.");
setWidths(cashflow, [260, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 120]);
cashflow.getRange("A4:N4").values = [["Line Item", "Jun-26", "Jul-26", "Aug-26", "Sep-26", "Oct-26", "Nov-26", "Dec-26", "Jan-27", "Feb-27", "Mar-27", "Apr-27", "May-27", "Total"]];
header(cashflow.getRange("A4:N4"));
cashflow.getRange("A5:A33").values = [
  ["Beginning Cash"],
  ["Known AR Collection"],
  ["Setup Sprint Revenue"],
  ["Beta Subscription Revenue"],
  ["Retainer Revenue"],
  ["Jumpstart / Growth Pod Revenue"],
  ["Total Cash In"],
  [""],
  ["Known AP Payment"],
  ["Baseline Tool/Admin Costs"],
  ["Variable Delivery Costs"],
  ["Owner Draw"],
  ["Total Cash Out"],
  [""],
  ["Net Cash Flow"],
  ["Ending Cash"],
  ["Cash Runway Status"],
  [""],
  ["Setup Sprints"],
  ["Active Beta Subscriptions"],
  ["Active Retainers"],
  ["Revenue per Setup Sprint"],
  ["Revenue per Beta Subscription"],
  ["Revenue per Retainer"],
  ["Variable Delivery Cost Rate"],
  ["Baseline Tool/Admin Cost"],
  ["Owner Draw"],
  ["Notes"],
  ["Model Limitation"],
];
cashflow.getRange("B5").formulas = [["=Assumptions!B5"]];
cashflow.getRange("C5:M5").formulas = [["=B20", "=C20", "=D20", "=E20", "=F20", "=G20", "=H20", "=I20", "=J20", "=K20", "=L20"]];
cashflow.getRange("B6").formulas = [["=Assumptions!B6"]];
cashflow.getRange("C6:M6").values = [[0,0,0,0,0,0,0,0,0,0,0]];
cashflow.getRange("B23:M23").formulas = [["=Assumptions!B16", "=B23", "=C23", "=D23+Assumptions!B19", "=E23", "=F23", "=G23+Assumptions!B19", "=H23", "=I23", "=J23+Assumptions!B19", "=K23", "=L23"]];
cashflow.getRange("B24:M24").formulas = [["=Assumptions!B17", "=B24+Assumptions!B20", "=C24+Assumptions!B20", "=D24+Assumptions!B20", "=E24+Assumptions!B20", "=F24+Assumptions!B20", "=G24+Assumptions!B20", "=H24+Assumptions!B20", "=I24+Assumptions!B20", "=J24+Assumptions!B20", "=K24+Assumptions!B20", "=L24+Assumptions!B20"]];
cashflow.getRange("B25:M25").formulas = [["=Assumptions!B18", "=B25", "=C25", "=D25", "=E25", "=F25", "=G25+Assumptions!B21", "=H25", "=I25", "=J25", "=K25", "=L25"]];
cashflow.getRange("B26:M26").formulas = [["=Assumptions!B8", "=B26", "=C26", "=D26", "=E26", "=F26", "=G26", "=H26", "=I26", "=J26", "=K26", "=L26"]];
cashflow.getRange("B27:M27").formulas = [["=Assumptions!B9", "=B27", "=C27", "=D27", "=E27", "=F27", "=G27", "=H27", "=I27", "=J27", "=K27", "=L27"]];
cashflow.getRange("B28:M28").formulas = [["=Assumptions!B12", "=B28", "=C28", "=D28", "=E28", "=F28", "=G28", "=H28", "=I28", "=J28", "=K28", "=L28"]];
cashflow.getRange("B29:M29").formulas = [["=Assumptions!B14", "=B29", "=C29", "=D29", "=E29", "=F29", "=G29", "=H29", "=I29", "=J29", "=K29", "=L29"]];
cashflow.getRange("B30:M30").formulas = [["=Assumptions!B13", "=B30", "=C30", "=D30", "=E30", "=F30", "=G30", "=H30", "=I30", "=J30", "=K30", "=L30"]];
cashflow.getRange("B31:M31").formulas = [["=Assumptions!B15", "=B31", "=C31", "=D31", "=E31", "=F31", "=G31", "=H31", "=I31", "=J31", "=K31", "=L31"]];
cashflow.getRange("B7:M7").formulas = [["=B23*B26", "=C23*C26", "=D23*D26", "=E23*E26", "=F23*F26", "=G23*G26", "=H23*H26", "=I23*I26", "=J23*J26", "=K23*K26", "=L23*L26", "=M23*M26"]];
cashflow.getRange("B8:M8").formulas = [["=B24*B27", "=C24*C27", "=D24*D27", "=E24*E27", "=F24*F27", "=G24*G27", "=H24*H27", "=I24*I27", "=J24*J27", "=K24*K27", "=L24*L27", "=M24*M27"]];
cashflow.getRange("B9:M9").formulas = [["=B25*B28", "=C25*C28", "=D25*D28", "=E25*E28", "=F25*F28", "=G25*G28", "=H25*H28", "=I25*I28", "=J25*J28", "=K25*K28", "=L25*L28", "=M25*M28"]];
cashflow.getRange("B10:M10").values = [[0,0,0,0,0,0,0,0,0,0,0,0]];
cashflow.getRange("B11:M11").formulas = [["=SUM(B6:B10)", "=SUM(C6:C10)", "=SUM(D6:D10)", "=SUM(E6:E10)", "=SUM(F6:F10)", "=SUM(G6:G10)", "=SUM(H6:H10)", "=SUM(I6:I10)", "=SUM(J6:J10)", "=SUM(K6:K10)", "=SUM(L6:L10)", "=SUM(M6:M10)"]];
cashflow.getRange("B13").formulas = [["=Assumptions!B7"]];
cashflow.getRange("C13:M13").values = [[0,0,0,0,0,0,0,0,0,0,0]];
cashflow.getRange("B14:M14").formulas = [["=B30", "=C30", "=D30", "=E30", "=F30", "=G30", "=H30", "=I30", "=J30", "=K30", "=L30", "=M30"]];
cashflow.getRange("B15:M15").formulas = [["=B11*B29", "=C11*C29", "=D11*D29", "=E11*E29", "=F11*F29", "=G11*G29", "=H11*H29", "=I11*I29", "=J11*J29", "=K11*K29", "=L11*L29", "=M11*M29"]];
cashflow.getRange("B16:M16").formulas = [["=B31", "=C31", "=D31", "=E31", "=F31", "=G31", "=H31", "=I31", "=J31", "=K31", "=L31", "=M31"]];
cashflow.getRange("B17:M17").formulas = [["=SUM(B13:B16)", "=SUM(C13:C16)", "=SUM(D13:D16)", "=SUM(E13:E16)", "=SUM(F13:F16)", "=SUM(G13:G16)", "=SUM(H13:H16)", "=SUM(I13:I16)", "=SUM(J13:J16)", "=SUM(K13:K16)", "=SUM(L13:L16)", "=SUM(M13:M16)"]];
cashflow.getRange("B19:M19").formulas = [["=B11-B17", "=C11-C17", "=D11-D17", "=E11-E17", "=F11-F17", "=G11-G17", "=H11-H17", "=I11-I17", "=J11-J17", "=K11-K17", "=L11-L17", "=M11-M17"]];
cashflow.getRange("B20:M20").formulas = [["=B5+B19", "=C5+C19", "=D5+D19", "=E5+E19", "=F5+F19", "=G5+G19", "=H5+H19", "=I5+I19", "=J5+J19", "=K5+K19", "=L5+L19", "=M5+M19"]];
cashflow.getRange("B21:M21").formulas = [["=IF(B20<Assumptions!B22,\"Needs Review\",\"OK\")", "=IF(C20<Assumptions!B22,\"Needs Review\",\"OK\")", "=IF(D20<Assumptions!B22,\"Needs Review\",\"OK\")", "=IF(E20<Assumptions!B22,\"Needs Review\",\"OK\")", "=IF(F20<Assumptions!B22,\"Needs Review\",\"OK\")", "=IF(G20<Assumptions!B22,\"Needs Review\",\"OK\")", "=IF(H20<Assumptions!B22,\"Needs Review\",\"OK\")", "=IF(I20<Assumptions!B22,\"Needs Review\",\"OK\")", "=IF(J20<Assumptions!B22,\"Needs Review\",\"OK\")", "=IF(K20<Assumptions!B22,\"Needs Review\",\"OK\")", "=IF(L20<Assumptions!B22,\"Needs Review\",\"OK\")", "=IF(M20<Assumptions!B22,\"Needs Review\",\"OK\")"]];
cashflow.getRange("B23:M23").format.numberFormat = "0";
cashflow.getRange("B24:M25").format.numberFormat = "0";
cashflow.getRange("B29:M29").format.numberFormat = pctFmt;
cashflow.getRange("B32:M33").values = [
  ["Update assumptions and replace placeholders as actual records become available.", "", "", "", "", "", "", "", "", "", "", ""],
  ["This is a cash planning model, not an audited P&L, balance sheet, tax record, or CPA-prepared forecast.", "", "", "", "", "", "", "", "", "", "", ""],
];
cashflow.getRange("B5:M20").format.numberFormat = moneyFmt;
cashflow.getRange("B26:M28").format.numberFormat = moneyFmt;
cashflow.getRange("B30:M30").format.numberFormat = moneyFmt;
cashflow.getRange("B31:M31").format.numberFormat = moneyFmt;
cashflow.getRange("N6:N21").formulas = [
  ["=SUM(B6:M6)"],["=SUM(B7:M7)"],["=SUM(B8:M8)"],["=SUM(B9:M9)"],["=SUM(B10:M10)"],["=SUM(B11:M11)"],[""],["=SUM(B13:M13)"],["=SUM(B14:M14)"],["=SUM(B15:M15)"],["=SUM(B16:M16)"],["=SUM(B17:M17)"],[""],["=SUM(B19:M19)"],["=M20"],[""]
];
cashflow.getRange("N6:N21").format.numberFormat = moneyFmt;
cashflow.getRange("A11:N11").format = { fill: lightGray, font: { bold: true } };
cashflow.getRange("A17:N17").format = { fill: lightGray, font: { bold: true } };
cashflow.getRange("A19:N21").format = { fill: lightTeal, font: { bold: true } };
cashflow.getRange("B23:M31").format = { fill: "#F8FAFC", font: { color: "#0000FF" } };
cashflow.getRange("B32:M33").format = { fill: redFill, font: { italic: true, color: "#7F1D1D" }, wrapText: true };
cashflow.getRange("B23:M31").format.numberFormat = moneyFmt;
cashflow.getRange("B23:M25").format.numberFormat = "0";
cashflow.getRange("B29:M29").format.numberFormat = pctFmt;
cashflow.getRange("B20:M20").conditionalFormats.add("cellIs", { operator: "lessThan", formula: 0, format: { fill: redFill, font: { bold: true, color: "#9B1C1C" } } });
cashflow.getRange("B20:M20").conditionalFormats.add("cellIs", { operator: "greaterThanOrEqual", formula: 0, format: { fill: greenFill, font: { bold: true, color: "#166534" } } });
cashflow.getRange("B23:M31").format.font = { color: "#0000FF" };

cashflow.getRange("P4:R4").values = [["Month", "Ending Cash", "Net Cash Flow"]];
header(cashflow.getRange("P4:R4"));
cashflow.getRange("P5:R16").formulas = [
  ["=B4","=B20","=B19"],
  ["=C4","=C20","=C19"],
  ["=D4","=D20","=D19"],
  ["=E4","=E20","=E19"],
  ["=F4","=F20","=F19"],
  ["=G4","=G20","=G19"],
  ["=H4","=H20","=H19"],
  ["=I4","=I20","=I19"],
  ["=J4","=J20","=J19"],
  ["=K4","=K20","=K19"],
  ["=L4","=L20","=L19"],
  ["=M4","=M20","=M19"],
];
cashflow.getRange("Q5:R16").format.numberFormat = moneyFmt;
const chart = cashflow.charts.add("line", cashflow.getRange("P4:R16"));
chart.title = "Projected Cash Movement";
chart.hasLegend = true;
chart.xAxis = { axisType: "textAxis" };
chart.yAxis = { numberFormatCode: "$#,##0" };
chart.setPosition("P18", "X34");

title(checks, "Model Checks", "Review status before uploading externally.");
setWidths(checks, [280, 160, 160, 140, 320]);
checks.getRange("A4:E4").values = [["Check", "Actual", "Expected", "Status", "Notes"]];
header(checks.getRange("A4:E4"));
checks.getRange("A5:E10").values = [
  ["Opening cash entered", "", "", "", "Current bank balance is still a placeholder unless updated."],
  ["Known AR entered", "", "", "", "Open invoices are still placeholders unless updated."],
  ["Known AP entered", "", "", "", "Open bills are still placeholders unless updated."],
  ["Ending cash formula tie-out", "", "", "", "Last month ending cash should equal cover cash projection output."],
  ["Formal P&L available", "No", "No", "", "Formal historical P&L is pending reconciliation."],
  ["Formal balance sheet available", "No", "No", "", "Formal balance sheet is pending reconciliation."],
];
checks.getRange("B5").formulas = [["=Assumptions!B5"]];
checks.getRange("C5").values = [["Review"]];
checks.getRange("D5").formulas = [["=IF(B5=0,\"Needs Review\",\"OK\")"]];
checks.getRange("B6").formulas = [["=Assumptions!B6"]];
checks.getRange("C6").values = [["Review"]];
checks.getRange("D6").formulas = [["=IF(B6=0,\"Needs Review\",\"OK\")"]];
checks.getRange("B7").formulas = [["=Assumptions!B7"]];
checks.getRange("C7").values = [["Review"]];
checks.getRange("D7").formulas = [["=IF(B7=0,\"Needs Review\",\"OK\")"]];
checks.getRange("B8").formulas = [["='Cash Flow Projection'!M20"]];
checks.getRange("C8").formulas = [["='Cash Flow Projection'!N20"]];
checks.getRange("D8").formulas = [["=IF(ABS(B8-C8)<1,\"OK\",\"Check\")"]];
checks.getRange("D9:D10").values = [["Disclosure OK"],["Disclosure OK"]];
checks.getRange("B5:C8").format.numberFormat = moneyFmt;
checks.getRange("A5:E10").format.wrapText = true;
checks.getRange("D5:D8").conditionalFormats.add("cellIs", { operator: "equalTo", formula: "\"OK\"", format: { fill: greenFill, font: { bold: true, color: "#166534" } } });
checks.getRange("D5:D8").conditionalFormats.add("cellIs", { operator: "notEqualTo", formula: "\"OK\"", format: { fill: yellow, font: { bold: true, color: "#7A5A00" } } });

title(sources, "Source Notes", "Input sources and audit trail.");
setWidths(sources, [260, 260, 420]);
sources.getRange("A4:C4").values = [["Source / Artifact", "Used For", "Notes"]];
header(sources.getRange("A4:C4"));
sources.getRange("A5:C13").values = [
  ["workflows/cul-01-vision-purpose/source/URC-CUL-01_Vision_Purpose.md", "Mission, vision, offer prices, zero outside investment / debt historical note", "March 2026 source; current debt/cash status should still be confirmed."],
  ["workflows/marketing-founder-signal-system/offer-one-pager.md", "Founder Signal setup sprint price and scope", "$1,000 one-time setup target."],
  ["docs/operations/urc-v1-operating-architecture.md", "Finance system role and tool architecture", "Frappe as finance system of record; low-cost bridge posture."],
  ["docs/operations/bootstrap-limit-threshold.md", "Tool-spend posture and revenue-before-platform rule", "Paid tools justified after proven bottleneck/revenue signal."],
  ["AI Native Agency Deepened/Finance Department/FIN01_Pricing_Expenses_Tracker.xlsx", "Expense tracker status", "Inspected; appears to be a finance workflow template, not a reconciled ledger."],
  ["AI Native Agency Deepened/Finance Department/FIN03_AR_AP_Tracker.xlsx", "AR/AP tracker status", "Inspected; appears to be a finance workflow template, not a reconciled live AR/AP ledger."],
  ["AI Native Agency Deepened/Finance Department/FIN06_Finance_KPI_Dashboard.xlsx", "Finance dashboard status", "Inspected; appears to be template/dashboard scaffold."],
  ["docs/operations/bootstrapper-uploads/urc-agent-lab-confidential-business-overview.md", "Business context", "Used for business model and offer ladder context."],
  ["User direction on 2026-05-24", "Scope selection", "Requested best-available Current Financial Position Summary and Cash Flow Projection only."],
];
sources.getRange("A5:C13").format.wrapText = true;

for (const sheet of [cover, position, assumptions, cashflow, checks, sources]) {
  sheet.freezePanes.freezeRows(4);
  sheet.getUsedRange(true).format.wrapText = true;
}

const inspectSummary = await workbook.inspect({ kind: "table", range: "Cash Flow Projection!A4:N22", include: "values,formulas", tableMaxRows: 25, tableMaxCols: 14 });
console.log(inspectSummary.ndjson.split("\n").slice(0, 8).join("\n"));
const errors = await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 100 }, summary: "formula error scan" });
console.log(errors.ndjson);

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
console.log(outputPath);
