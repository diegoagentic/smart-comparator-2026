import React, { useState, useMemo, Fragment } from 'react';
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react';

// =====================================================================
// Icons
// =====================================================================
const Icon = {
  Check:   (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12.5l5 5 9-11"/></svg>,
  X:       (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 6l12 12M6 18L18 6"/></svg>,
  Sparkle: (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></svg>,
  Warn:    (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 9v4m0 4h.01M10.3 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.7 3.86a2 2 0 00-3.4 0z"/></svg>,
  Info:    (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>,
  Chevron: (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9l6 6 6-6"/></svg>,
  Close:   (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 6l12 12M6 18L18 6"/></svg>,
  Ban:     (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/></svg>,
  Plus:    (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  Pencil:  (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 20h4L20 8l-4-4L4 16v4z"/></svg>,
  Arrow:   (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
  Dot:     (p: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><circle cx="12" cy="12" r="4"/></svg>,
  Search:  (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>,
  Folder:  (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>,
  Refresh: (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12a9 9 0 0115.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 01-15.5 6.3L3 16M3 21v-5h5"/></svg>,
  Back:    (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 12H5M11 19l-7-7 7-7"/></svg>,
};

// =====================================================================
// Resolution → visual tone
// =====================================================================
const TONE: Record<string, any> = {
  resolved:       { pill: "bg-[#E8F5E9] text-green-800",       dot: "bg-green-600",  label: "Ready",          ring: "ring-green-200/60" },
  ai_suggested:   { pill: "bg-[#E6F993] text-[#507206]",       dot: "bg-[#718B03]",  label: "AI Match",       ring: "ring-brand-300/60" },
  ai_uncertain:   { pill: "bg-amber-100 text-amber-700",       dot: "bg-amber-500",  label: "Review",         ring: "ring-amber-200/60" },
  partial:        { pill: "bg-amber-100 text-amber-700",       dot: "bg-amber-500",  label: "Partial match",  ring: "ring-amber-200/60" },
  unresolved:     { pill: "bg-red-100 text-red-700",           dot: "bg-red-500",    label: "Needs choice",   ring: "ring-red-200/60" },
  unmapped:       { pill: "bg-zinc-100 text-muted-foreground",         dot: "bg-zinc-400",   label: "Not sent",       ring: "ring-zinc-200/60" },
  coercion_error: { pill: "bg-orange-100 text-orange-600",     dot: "bg-orange-500", label: "Fix Value",      ring: "ring-red-200/60" },
};

// =====================================================================
// Mock Data (PREFLIGHT)
// =====================================================================
const PREFLIGHT: any = {
  valid: false,
  recordType: "purchase_order",
  sections: [
    {
      id: "poInfo",
      label: "PO info",
      fields: [
        { dtoPath: "poInfo.orderNumber",  displayName: "Order Number",  targetDataType: "String",  inputValue: "PO-001", resolution: "resolved", resolvedValue: "PO-001", required: true },
        { dtoPath: "poInfo.poIssueDate",  displayName: "PO Issue Date", targetDataType: "Date",    inputValue: "tomorrow", resolution: "coercion_error", reason: "INVALID_DATE", required: true },
        { dtoPath: "poInfo.orderDate",    displayName: "Order Date",    targetDataType: "Date",    inputValue: "2026-01-15", resolution: "resolved", resolvedValue: "2026-01-15" },
        { dtoPath: "poInfo.terms",        displayName: "Terms",         targetDataType: "DropDown",inputValue: "Net 30", resolution: "resolved", resolvedValue: 421,
          knownValues: [{id: 421, label: "Net 30"}, {id: 422, label: "Net 60"}] },
        { dtoPath: "poInfo.requestType",  displayName: "Request Type",  targetDataType: "DropDown",inputValue: "Standrd", resolution: "ai_suggested", suggestion: 612, aiConfidence: 0.94, required: true,
          knownValues: [
            { id: 612, label: "Standard" }, { id: 613, label: "Expedited" },
            { id: 614, label: "Sample" }, { id: 615, label: "Replacement" },
            { id: 616, label: "Warranty" }, { id: 617, label: "Backorder" },
          ] },
      ],
    },
    {
      id: "vendor",
      label: "Vendor",
      fields: [
        { dtoPath: "vendor.vendorId",    displayName: "Vendor",         targetDataType: "DropDown", inputValue: "acm", resolution: "ai_uncertain", suggestion: 99, aiConfidence: 0.51, required: true,
          knownValues: [
            { id: 99,  label: "Acme Corp" },           { id: 100, label: "Acme Industrial" },
            { id: 101, label: "Apex Partners" },       { id: 102, label: "Atlas Supply" },
            { id: 103, label: "Allied Fabricators" },  { id: 104, label: "Anchor Logistics" },
            { id: 105, label: "Andersen & Co." },      { id: 106, label: "Apex Furnishings" },
          ] },
        { dtoPath: "vendor.billToName",  displayName: "Bill To Name",   targetDataType: "String",   inputValue: "Acme Corp \u00b7 AP Dept", resolution: "resolved", resolvedValue: "Acme Corp \u00b7 AP Dept" },
        { dtoPath: "vendor.email",       displayName: "Vendor Email",   targetDataType: "Email",    inputValue: "ap@acme", resolution: "unresolved", reason: "INVALID_EMAIL" },
        { dtoPath: "vendor.phone",       displayName: "Vendor Phone",   targetDataType: "Phone",    inputValue: "+1 (555) 010-0199", resolution: "resolved", resolvedValue: "+1 (555) 010-0199" },
      ],
    },
    {
        id: "shipping",
        label: "Shipping",
        fields: [
          {
            dtoPath: "shipping.shipTo",
            displayName: "Ship To",
            targetDataType: "Object",
            isObject: true,
            children: [
              { dtoPath: "shipping.shipTo.name",       displayName: "Name",        targetDataType: "String", inputValue: "ACME Warehouse", resolution: "resolved", resolvedValue: "ACME Warehouse" },
              { dtoPath: "shipping.shipTo.street",     displayName: "Street",      targetDataType: "String", inputValue: "500 Warehouse Way", resolution: "resolved", resolvedValue: "500 Warehouse Way" },
              { dtoPath: "shipping.shipTo.city",       displayName: "City",        targetDataType: "String", inputValue: "Miami",     resolution: "resolved", resolvedValue: "Miami" },
              { dtoPath: "shipping.shipTo.state",      displayName: "State",       targetDataType: "DropDown", inputValue: "XX", resolution: "unresolved", reason: "VALUE_NOT_IN_LIST",
                knownValues: [
                  { id: 1, label: "AL" }, { id: 2, label: "AK" }, { id: 3, label: "AZ" }, { id: 4, label: "AR" }, { id: 5, label: "CA" },
                  { id: 6, label: "CO" }, { id: 7, label: "CT" }, { id: 8, label: "DE" }, { id: 9, label: "FL" }, { id: 10, label: "GA" },
                  { id: 11, label: "HI" }, { id: 12, label: "ID" }, { id: 13, label: "IL" }, { id: 14, label: "IN" }, { id: 15, label: "IA" },
                  { id: 16, label: "KS" }, { id: 17, label: "KY" }, { id: 18, label: "LA" }, { id: 19, label: "ME" }, { id: 20, label: "MD" },
                  { id: 21, label: "MA" }, { id: 22, label: "MI" }, { id: 23, label: "MN" }, { id: 24, label: "MS" }, { id: 25, label: "MO" },
                  { id: 26, label: "MT" }, { id: 27, label: "NE" }, { id: 28, label: "NV" }, { id: 29, label: "NH" }, { id: 30, label: "NJ" },
                  { id: 31, label: "NM" }, { id: 32, label: "NY" }, { id: 33, label: "NC" }, { id: 34, label: "ND" }, { id: 35, label: "OH" },
                  { id: 36, label: "OK" }, { id: 37, label: "OR" }, { id: 38, label: "PA" }, { id: 39, label: "RI" }, { id: 40, label: "SC" },
                  { id: 41, label: "SD" }, { id: 42, label: "TN" }, { id: 43, label: "TX" }, { id: 44, label: "UT" }, { id: 45, label: "VT" },
                  { id: 46, label: "VA" }, { id: 47, label: "WA" }, { id: 48, label: "WV" }, { id: 49, label: "WI" }, { id: 50, label: "WY" },
                ] },
              { dtoPath: "shipping.shipTo.zip",         displayName: "Postal Code", targetDataType: "String", inputValue: "33101", resolution: "resolved", resolvedValue: "33101" },
              { dtoPath: "shipping.shipTo.country",     displayName: "Country",     targetDataType: "String", inputValue: "US",    resolution: "resolved", resolvedValue: "US" },
            ],
          },
          { dtoPath: "shipping.freightTerms",    displayName: "Freight Terms",    targetDataType: "String",  inputValue: "8001", resolution: "resolved", resolvedValue: "8001" },
          { dtoPath: "shipping.installComplete", displayName: "Install Complete", targetDataType: "Boolean", inputValue: true,   resolution: "resolved", resolvedValue: "Yes" },
          { dtoPath: "shipping.locationType",    displayName: "Location Type",   targetDataType: "String",  inputValue: "9011", resolution: "resolved", resolvedValue: "9011" },
        ],
      },
      {
        id: "financials",
        label: "Financials",
        fields: [
          { dtoPath: "financials.totalAmount", displayName: "PO Total Amounts", targetDataType: "Currency", inputValue: "$12,489.95", resolution: "resolved", resolvedValue: "$12,489.95", required: true },
          { dtoPath: "financials.totalAmount2", displayName: "PO Total Amounts", targetDataType: "Currency", inputValue: "$11,740.00", resolution: "resolved", resolvedValue: "$11,740.00" },
          { dtoPath: "financials.freight",      displayName: "Freight 2",        targetDataType: "Currency", inputValue: "$249.95",   resolution: "resolved", resolvedValue: "$249.95" },
          { dtoPath: "financials.salesTax",    displayName: "Sales Tax",        targetDataType: "Currency", inputValue: "n/a",       resolution: "coercion_error", reason: "INVALID_CURRENCY" },
          { dtoPath: "financials.discount",     displayName: "Discount Amount",  targetDataType: "Currency", inputValue: "$500.00",   resolution: "resolved", resolvedValue: "$500.00" },
        ],
      },
      {
        id: "project",
        label: "Project",
        fields: [
          { dtoPath: "project.endCustomerName", displayName: "End Customer Name", targetDataType: "String", inputValue: "Avanto HQ Refresh", resolution: "resolved", resolvedValue: "Avanto HQ Refresh" },
          { dtoPath: "project.salesPerson",     displayName: "Sales Person",     targetDataType: "String", inputValue: "2001",              resolution: "resolved", resolvedValue: "2001" },
          { dtoPath: "project.region",          displayName: "Region",           targetDataType: "String", inputValue: "311",               resolution: "resolved", resolvedValue: "311" },
          { 
            dtoPath: "project.processors",      displayName: "Processors",       targetDataType: "Collection", isCollection: true, resolution: "partial",
            items: [
              { original: "viviana ruiz", fixed: "Viviana Ruiz", confidence: 0.99, resolution: "resolved" },
              { original: "m webb",       fixed: null,           confidence: null, resolution: "unresolved" },
              { original: "priyah s",      fixed: "Priyah Shah",  confidence: 0.99, resolution: "resolved" },
              { original: "ren laurent",   fixed: "Renée Laurent",confidence: 0.87, resolution: "ai_suggested" },
              { original: "unknown",       fixed: null,           confidence: null, resolution: "unresolved" },
            ]
          },
          { dtoPath: "project.furnitureRequired", displayName: "Furniture Required?", targetDataType: "Boolean", inputValue: true, resolution: "resolved", resolvedValue: "Yes" },
          { dtoPath: "project.furnitureSubCategory", displayName: "Furniture Sub Category", targetDataType: "String", inputValue: "Seating, Desking", resolution: "resolved", resolvedValue: "Seating, Desking" },
        ],
      },
      {
        id: "notes",
        label: "Notes",
        fields: [
          { dtoPath: "notes.main",        displayName: "Notes",               targetDataType: "String", inputValue: "Confirmed pricing w/vendor on 4/18", resolution: "resolved", resolvedValue: "Confirmed pricing w/vendor on 4/18" },
          { dtoPath: "notes.additional",  displayName: "Additional Comments", targetDataType: "String", inputValue: "Rush for Q2 open house", resolution: "unmapped", reason: "NOT_SUPPORTED_IN_TARGET" },
        ],
      },
      {
        id: "extra",
        label: "Extra Fields",
        isExtraSection: true,
        fields: [
          { dtoPath: "extra.dealerCompany", displayName: "Dealer Company", targetDataType: "String", inputValue: "Avanto", resolution: "resolved", resolvedValue: "Avanto", required: true, isExtra: true },
          { 
            dtoPath: "extra.soldTo",        displayName: "Sold To",           targetDataType: "Object",   isObject: true, required: true, isExtra: true,
            children: [
              { dtoPath: "extra.soldTo.account", displayName: "Account",     targetDataType: "String", inputValue: "Avanto Sold",    resolution: "resolved", resolvedValue: "Avanto Sold" },
              { dtoPath: "extra.soldTo.street",  displayName: "Street",      targetDataType: "String", inputValue: "100 Market Street", resolution: "resolved", resolvedValue: "100 Market Street" },
              { dtoPath: "extra.soldTo.city",    displayName: "City",        targetDataType: "String", inputValue: "San Francisco",  resolution: "resolved", resolvedValue: "San Francisco" },
              { dtoPath: "extra.soldTo.state",   displayName: "State",       targetDataType: "String", inputValue: "CA",             resolution: "resolved", resolvedValue: "CA" },
              { dtoPath: "extra.soldTo.zip",     displayName: "Postal Code", targetDataType: "String", inputValue: "94103",          resolution: "resolved", resolvedValue: "94103" },
              { dtoPath: "extra.soldTo.country", displayName: "Country",     targetDataType: "String", inputValue: "US",             resolution: "resolved", resolvedValue: "US" },
            ]
          },
        ],
      },
  ],
  lineItems: [
    {
      rowIndex: 1,
      fields: [
        { dtoPath: "productNumber", displayName: "Product", inputValue: "SKU-1", resolution: "resolved", resolvedValue: "SKU-1" },
        { dtoPath: "productDescription", displayName: "Description", inputValue: "Aeron — Size B, Graphite", resolution: "resolved", resolvedValue: "Aeron — Size B, Graphite" },
        { dtoPath: "quantity", displayName: "Qty", inputValue: "2", resolution: "resolved", resolvedValue: "2" },
        { dtoPath: "productList", displayName: "List", inputValue: "1295.00", resolution: "resolved", resolvedValue: "1295.00" },
        { dtoPath: "catalogCode", displayName: "Catalog Code", inputValue: "widg-a", resolution: "resolved", resolvedValue: "widg-a" },
      ]
    },
    {
      rowIndex: 2,
      fields: [
        { dtoPath: "productNumber", displayName: "Product", inputValue: "SKU-2", resolution: "resolved", resolvedValue: "SKU-2" },
        { dtoPath: "productDescription", displayName: "Description", inputValue: "Eames Soft Pad, Low Back", resolution: "resolved", resolvedValue: "Eames Soft Pad, Low Back" },
        { dtoPath: "quantity", displayName: "Qty", inputValue: "5", resolution: "resolved", resolvedValue: "5" },
        { dtoPath: "productList", displayName: "List", inputValue: "2890.00", resolution: "resolved", resolvedValue: "2890.00" },
        { 
          dtoPath: "catalogCode", displayName: "Catalog Code", inputValue: "???", resolution: "ai_uncertain", 
          reason: "MULTIPLE_MATCHES",
          knownValues: [
             { id: "a", label: "Widget A" },
             { id: "b", label: "Widget B" },
             { id: "c", label: "Widget C" },
          ]
        },
      ]
    },
    {
      rowIndex: 3,
      fields: [
        { dtoPath: "productNumber", displayName: "Product", inputValue: "SKU-3", resolution: "resolved", resolvedValue: "SKU-3" },
        { dtoPath: "productDescription", displayName: "Description", inputValue: "Steelcase Leap v2", resolution: "resolved", resolvedValue: "Steelcase Leap v2" },
        { dtoPath: "quantity", displayName: "Qty", inputValue: "1", resolution: "resolved", resolvedValue: "1" },
        { dtoPath: "productList", displayName: "List", inputValue: "1100.00", resolution: "resolved", resolvedValue: "1100.00" },
        { dtoPath: "catalogCode", displayName: "Catalog Code", inputValue: "widg-c", resolution: "resolved", resolvedValue: "widg-c" },
      ]
    }
  ],
};
const PROCESSOR_DIRECTORY = [
  "Viviana Ruiz",
  "Priyah Shah",
  "Renée Laurent",
  "Marcus Webb",
  "Mark Webb",
  "Miles Webster",
  "Sarah Jenkins",
  "Sam Smith",
];



// =====================================================================
// Sub-components
// =====================================================================
function ResolutionPill({ resolution }: { resolution: string }) {
  const t = TONE[resolution] || TONE.unresolved;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${t.pill}`}>
      {resolution === "resolved" && <Icon.Check className="size-3.5" />}
      {(resolution === "ai_uncertain" || resolution === "partial" || resolution === "coercion_error") && <Icon.Warn className="size-3.5" />}
      {t.label}
    </span>
  );
}

function Eyebrow({ children, trailing }: { children: React.ReactNode; trailing?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3 mt-8 first:mt-0">
      <span className="eyebrow">{children}</span>
      {trailing}
    </div>
  );
}

// ---------------------------------------------------------------------
// Field Row & Body
// ---------------------------------------------------------------------
function FieldRow({ field, state, setState, compact }: any) {
  const effective = state?.effectiveResolution || field.resolution;
  const isLocked = state?.locked;

  return (
    <div className={`field-row rounded-xl border bg-white transition ${isLocked ? "border-green-200" : "border-zinc-200"} hover:border-zinc-300`}>
      <div className={`${compact ? "px-4 pt-3" : "px-5 pt-4"} flex items-start justify-between gap-4`}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            {field.isExtra && (
               <div className="size-4 rounded bg-[#d6f22e] flex items-center justify-center text-zinc-900 shrink-0">
                  <Icon.Check className="size-3" strokeWidth={3} />
               </div>
            )}
            <span className="text-[14px] font-bold text-zinc-900 truncate">
              {field.displayName}
            </span>
            {field.required && (
              <span className="inline-flex items-center rounded-full bg-red-100 text-red-600 px-2.5 py-0.5 text-[10px] font-medium">Required</span>
            )}
          </div>
        </div>
        <ResolutionPill resolution={effective} />
      </div>

      <div className={`${compact ? "px-4 pb-3 pt-2" : "px-5 pb-5 pt-3"}`}>
        <FieldBody field={field} state={state} setState={setState} effective={effective} />
      </div>
    </div>
  );
}

function FieldBody({ field, state, setState, effective }: any) {
  const [picking, setPicking] = useState(false);
  const [pickedValue, setPickedValue] = useState<string | null>(null);
  const [manualVal, setManualVal] = useState(state?.overrideValue || "");

  // Sync manualVal if parent state changes (e.g. Reset)
  React.useEffect(() => {
    setManualVal(state?.overrideValue || "");
  }, [state?.overrideValue]);

  // If we have an override, show the override summary with a Reset button
  if (state?.overrideValue != null && effective === "resolved" && field.resolution !== "resolved") {
    return (
      <div className="flex items-center justify-between gap-2 rounded-md bg-green-50/60 border border-green-100 px-3 py-2">
        <div className="text-[13px] text-green-900 truncate font-medium">
          <Icon.Check className="size-3.5 inline mr-1.5 -mt-0.5" /> {state.overrideValue}
        </div>
        <button
          onClick={() => setState({ overrideValue: null, locked: false, effectiveResolution: field.resolution })}
          className="text-green-700/70 hover:text-green-900 text-[12px] font-medium shrink-0"
        >
          Reset
        </button>
      </div>
    );
  }

  // Layout for Original vs Fixed Value
  const renderTwoColumns = (input: any, final: React.ReactNode) => (
    <div className="grid grid-cols-2 gap-4 mt-1">
      <div>
        <p className="text-[13px] font-medium text-zinc-900 mb-2">Original Value</p>
        <div className="bg-[#F1F3F5] border border-zinc-200 rounded-lg px-3 py-2 text-[14px] text-muted-foreground">
          {String(input || "—")}
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-zinc-900 mb-2">Fixed Value</p>
        {final}
      </div>
    </div>
  );

  switch (field.resolution) {
    case "resolved":
      return (
        <div className="flex items-center gap-2 text-[14px] text-zinc-800 mt-1">
          {field.targetDataType === 'Boolean' && (
            <div className="size-4 rounded bg-[#d6f22e] flex items-center justify-center text-zinc-900">
              <Icon.Check className="size-3" strokeWidth={3} />
            </div>
          )}
          {field.isExtra ? (
            <input 
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[14px] text-zinc-900 focus:outline-none focus:border-zinc-400 transition-colors"
              value={state?.overrideValue ?? field.resolvedValue}
              onChange={(e) => setState({ overrideValue: e.target.value, effectiveResolution: "resolved", isDirty: true })}
            />
          ) : (
            String(field.resolvedValue)
          )}
        </div>
      );

    case "ai_suggested":
    case "ai_uncertain": {
      const label = (field.knownValues || []).find((kv: any) => kv.id === field.suggestion)?.label || field.suggestion;
      if (picking) {
        return renderTwoColumns(field.inputValue, (
            <div>
                <div className="relative">
                    <select 
                        autoFocus
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[14px] focus:outline-none focus:border-zinc-300 appearance-none"
                        value={pickedValue || ""}
                        onChange={(e) => setPickedValue(e.target.value)}
                    >
                        <option value="" disabled>Select an option...</option>
                        {(field.knownValues || []).map((kv: any) => (
                            <option key={kv.id} value={kv.label}>{kv.label}</option>
                        ))}
                    </select>
                    <Icon.Chevron className="absolute right-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
                </div>
                <div className="flex items-center justify-end gap-4 mt-3">
                    <button onClick={() => { setPicking(false); setPickedValue(null); }} className="text-muted-foreground hover:text-muted-foreground text-[13px] font-semibold transition-colors">Cancel</button>
                    {pickedValue && (
                        <button onClick={() => {
                            setState({ overrideValue: pickedValue, locked: true, effectiveResolution: "resolved" });
                            setPicking(false);
                            setPickedValue(null);
                        }} className="bg-[#0f8b18] hover:bg-green-800 text-white px-4 py-1.5 rounded-md text-[13px] font-semibold flex items-center gap-1.5 transition-colors">
                            <Icon.Check className="size-3.5" /> Accept
                        </button>
                    )}
                </div>
            </div>
        ));
      }
      return renderTwoColumns(field.inputValue, (
        <div>
            <div className="flex items-center justify-between border border-zinc-200 rounded-lg px-3 py-2 text-[14px] bg-white">
                <span className="text-muted-foreground italic">Possible match: <span className="font-bold text-zinc-900 not-italic">{label}</span></span>
                <span className="text-[#718B03] font-medium flex items-center gap-1 text-[12px]">
                    <Icon.Sparkle className="size-3.5" />
                    {Math.round(field.aiConfidence * 100)}% Confidence
                </span>
            </div>
            <div className="flex items-center justify-end gap-3 mt-3">
                <button onClick={() => setPicking(true)} className="border border-zinc-200 text-muted-foreground hover:bg-muted px-4 py-1.5 rounded-md text-[13px] font-semibold transition-colors">Pick another</button>
                <button onClick={() => setState({ overrideValue: label, locked: true, effectiveResolution: "resolved" })} className="bg-[#0f8b18] hover:bg-green-800 text-white px-4 py-1.5 rounded-md text-[13px] font-semibold flex items-center gap-1.5 transition-colors">
                    <Icon.Check className="size-3.5" /> Accept
                </button>
            </div>
        </div>
      ));
    }

    case "unresolved":
    case "coercion_error": {
      return renderTwoColumns(field.inputValue, (
        <div>
            <div className="relative">
                {field.targetDataType === 'DropDown' ? (
                  <>
                    <select 
                        autoFocus
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[14px] focus:outline-none focus:border-zinc-300 appearance-none"
                        value={manualVal}
                        onChange={(e) => setManualVal(e.target.value)}
                    >
                        <option value="" disabled>Select an option...</option>
                        {(field.knownValues || []).map((kv: any) => (
                            <option key={kv.id} value={kv.label}>{kv.label}</option>
                        ))}
                    </select>
                    <Icon.Chevron className="absolute right-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
                  </>
                ) : (
                  <>
                    <input 
                        autoFocus
                        type={field.targetDataType === 'Date' ? 'date' : 'text'}
                        value={manualVal}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[14px] focus:outline-none focus:border-zinc-300 text-zinc-900 placeholder:italic placeholder:text-muted-foreground"
                        placeholder={field.targetDataType === 'Currency' || field.targetDataType === 'Number' ? 'Enter numeric value' : 'Fix the value to continue...'}
                        onChange={(e) => setManualVal(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && manualVal.trim()) {
                                setState({ overrideValue: manualVal, locked: true, effectiveResolution: "resolved" });
                            }
                        }}
                    />
                  </>
                )}
            </div>
            <div className="flex items-center justify-end gap-4 mt-3">
                <button 
                  onClick={() => { if (field.knownValues?.length) setPicking(true); else setManualVal(""); }}
                  className="border border-zinc-200 text-muted-foreground hover:bg-muted px-4 py-1.5 rounded-md text-[13px] font-semibold transition-colors"
                >
                  {field.knownValues?.length ? "Pick another" : "Cancel"}
                </button>
                <button 
                    disabled={!manualVal.trim()}
                    onClick={() => {
                        if (manualVal.trim()) setState({ overrideValue: manualVal, locked: true, effectiveResolution: "resolved" });
                    }} 
                    className={`bg-[#0f8b18] hover:bg-green-800 text-white px-4 py-1.5 rounded-md text-[13px] font-semibold flex items-center gap-1.5 transition-colors ${!manualVal.trim() ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                    <Icon.Check className="size-3.5" /> Accept
                </button>
            </div>
        </div>
      ));
    }

    case "unmapped":
      return (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-3 text-[12.5px] text-muted-foreground mt-2 flex gap-3 items-start">
          <Icon.Ban className="size-4 text-muted-foreground shrink-0 mt-0.5" />
          <div>This value won't be stored on the record. Input was "{field.inputValue}".</div>
        </div>
      );

    default:
      return <div className="text-[14px] text-muted-foreground italic mt-1">Unmapped</div>;
  }
}

// ---------------------------------------------------------------------
// Collection Field Group (for multi-value fields like Processors)
// ---------------------------------------------------------------------
function CollectionItem({ item, stateKey, setFS }: { item: any; stateKey?: string; setFS?: (patch: any) => void }) {
  const [picking, setPicking] = useState(false);
  const [dropped, setDropped] = useState(false);
  const [pickedValue, setPickedValue] = useState("");
  const [rejected, setRejected] = useState(false);
  const [localChoice, setLocalChoice] = useState("");

  const isResolved = !dropped && !rejected && (item.resolution === "resolved" || pickedValue);
  const isSuggested = !dropped && !rejected && !pickedValue && item.resolution === "ai_suggested";
  const isUnresolved = (rejected || item.resolution === "unresolved") && !dropped && !pickedValue && !picking;
  const isDropped = dropped;
  const isPicked = !!pickedValue && !picking;

  const borderColor = isResolved ? "border-green-500" : isSuggested ? "border-indigo-500" : (isDropped ? "border-zinc-300" : "border-amber-500");

  const effectiveResolution = dropped ? 'resolved' : pickedValue ? 'resolved' : item.resolution === 'resolved' && !rejected ? 'resolved' : item.resolution === 'ai_suggested' && !rejected ? 'ai_suggested' : 'unresolved';
  React.useEffect(() => {
    if (stateKey && setFS) setFS({ effectiveResolution });
  }, [effectiveResolution]);

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm flex">
       <div className={`w-1 ${borderColor} shrink-0`} />
       <div className="flex-1 p-4">
          <div className="grid grid-cols-2 gap-8">
             <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Original Value</p>
                <div className="bg-zinc-100/80 border border-zinc-100 rounded-lg px-3 py-2.5 text-[14px] text-muted-foreground font-medium">
                   {item.original}
                </div>
             </div>
             <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Fixed Value</p>
                
                {picking && (
                   <div className="space-y-3">
                      <div className="relative">
                         <select 
                            value={localChoice}
                            onChange={(e) => setLocalChoice(e.target.value)}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[14px] focus:outline-none focus:border-zinc-300 appearance-none"
                         >
                            <option value="" disabled>Select an option...</option>
                            {/* Filter directory for matches or just show relevant ones */}
                            {PROCESSOR_DIRECTORY.filter(name => {
                               if (item.original.toLowerCase() === 'unknown') return true;
                               const firstChar = item.original.charAt(0).toLowerCase();
                               const lastName = item.original.split(' ').pop()?.toLowerCase();
                               return name.toLowerCase().startsWith(firstChar) || (lastName && name.toLowerCase().includes(lastName));
                            }).map(name => (
                               <option key={name} value={name}>{name}</option>
                            ))}
                            {/* Always allow the capitalized version as an option, unless it's 'unknown' */}
                            {item.original.toLowerCase() !== 'unknown' && (
                               <option value={item.original.split(' ').map((s: string) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')}>
                                  {item.original.split(' ').map((s: string) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')} (Capitalized)
                               </option>
                            )}
                         </select>
                         <Icon.Chevron className="absolute right-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
                      </div>
                      <div className="flex items-center justify-end gap-3">
                         <button onClick={() => setPicking(false)} className="text-muted-foreground hover:text-muted-foreground text-[13px] font-semibold">Cancel</button>
                         <button 
                            disabled={!localChoice}
                            onClick={() => {
                               setPickedValue(localChoice);
                               setPicking(false);
                               setDropped(false);
                               setRejected(false);
                            }} 
                            className={`bg-[#0f8b18] hover:bg-green-800 text-white px-4 py-1.5 rounded-md text-[13px] font-semibold flex items-center gap-1.5 transition-colors ${!localChoice ? "opacity-40 cursor-not-allowed" : ""}`}
                         >
                            <Icon.Check className="size-3.5" /> Accept
                         </button>
                      </div>
                   </div>
                )}

                {isPicked && (
                   <div className="flex items-center justify-between h-10">
                      <div className="flex items-center gap-2">
                         <span className="text-[12px] text-muted-foreground italic">Matched to:</span>
                         <span className="text-[14px] font-bold text-zinc-900">{pickedValue}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <button onClick={() => setPicking(true)} className="text-[12px] font-bold text-zinc-900 hover:underline">Change</button>
                         <button onClick={() => setPickedValue("")} className="text-[12px] font-bold text-muted-foreground hover:underline">Undo</button>
                      </div>
                   </div>
                )}

                {isDropped && (
                   <div className="flex items-center justify-between h-10">
                      <span className="text-[13px] font-medium text-muted-foreground italic">Won't be saved</span>
                      <button onClick={() => setDropped(false)} className="text-[12px] font-bold text-muted-foreground hover:underline">Undo</button>
                   </div>
                )}

                {isResolved && !pickedValue && !picking && (
                   <div className="flex items-center justify-between h-10">
                      <div className="flex items-center gap-2">
                         <span className="text-[12px] text-muted-foreground italic">Matched to:</span>
                         <span className="text-[14px] font-bold text-zinc-900">{item.fixed}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-[11px] text-green-600 font-bold flex items-center gap-1">
                            <Icon.Sparkle className="size-3" /> {Math.round(item.confidence * 100)}% Confidence
                         </span>
                         <button onClick={() => setPicking(true)} className="text-[12px] font-bold text-zinc-900 hover:underline">Change</button>
                      </div>
                   </div>
                )}

                {isUnresolved && (
                   <div className="space-y-3">
                      <div className="flex items-center justify-between border border-zinc-200 rounded-lg px-3 py-2 text-[14px] bg-white">
                         <span className="text-muted-foreground italic">Possible match: <span className="font-bold text-zinc-900 not-italic">—</span></span>
                         <span className="text-amber-500 font-bold flex items-center gap-1 text-[11px]">
                            <Icon.Warn className="size-3.5" /> No match found
                         </span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                         <button onClick={() => setDropped(true)} className="border border-zinc-200 text-muted-foreground hover:bg-muted px-4 py-1.5 rounded-md text-[12px] font-bold transition-colors">Drop Value</button>
                         <button onClick={() => setPicking(true)} className="bg-green-700 hover:bg-green-800 text-white px-4 py-1.5 rounded-md text-[12px] font-bold transition-colors">Pick from list</button>
                      </div>
                   </div>
                )}

                {isSuggested && (
                   <div className="space-y-3">
                      <div className="flex items-center justify-between border border-zinc-200 rounded-lg px-3 py-2 text-[14px] bg-white">
                         <span className="text-muted-foreground italic">AI Suggestion: <span className="font-bold text-zinc-900 not-italic">{item.fixed}</span></span>
                         <span className="text-indigo-500 font-bold flex items-center gap-1 text-[11px]">
                            <Icon.Sparkle className="size-3.5" /> {Math.round(item.confidence * 100)}% Confidence
                         </span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                         <button onClick={() => setRejected(true)} className="border border-red-200 text-red-600 hover:bg-red-50 px-4 py-1.5 rounded-md text-[12px] font-bold transition-colors">Reject</button>
                         <button onClick={() => setPicking(true)} className="border border-zinc-200 text-muted-foreground hover:bg-muted px-4 py-1.5 rounded-md text-[12px] font-bold transition-colors">Change</button>
                         <button onClick={() => setPickedValue(item.fixed)} className="bg-green-700 hover:bg-green-800 text-white px-4 py-1.5 rounded-md text-[12px] font-bold flex items-center gap-1.5 transition-colors">
                            <Icon.Check className="size-3.5" /> Accept
                         </button>
                      </div>
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
}

function CollectionFieldGroup({ field, fieldState, setFS, sectionId }: any) {
  const [expanded, setExpanded] = useState(true);
  const items = field.items || [];
  
  const summary = {
    received: items.length,
    ai: items.filter((i: any) => i.resolution === "ai_suggested").length,
    review: items.filter((i: any) => i.resolution === "unresolved" || i.resolution === "ai_suggested").length
  };

  return (
    <div className={`rounded-xl border transition-all ${expanded ? "border-amber-200 bg-amber-50/10" : "border-zinc-200 bg-white"}`}>
      <div 
        onClick={() => setExpanded(!expanded)}
        className="px-5 py-4 flex items-center justify-between cursor-pointer"
      >
        <div>
          <div className="text-[14px] font-bold text-zinc-900">{field.displayName}</div>
          <div className="flex items-center gap-3 mt-1">
             <span className="text-[11px] text-muted-foreground font-medium">{summary.received} values received</span>
             <span className="text-zinc-300">•</span>
             <span className="text-[11px] text-indigo-500 font-bold flex items-center gap-1">
                <Icon.Sparkle className="size-3" /> {summary.ai} AI suggestion
             </span>
             <span className="text-zinc-300">•</span>
             <span className="text-[11px] text-amber-600 font-bold">{summary.review} left to review</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <ResolutionPill resolution={field.resolution} />
           <Icon.Chevron className={`size-5 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 space-y-3">
           {items.map((item: any, idx: number) => {
             const stateKey = `h:${sectionId}:${field.dtoPath}:${idx}`;
             return <CollectionItem key={idx} item={item} stateKey={stateKey} setFS={setFS ? setFS(stateKey) : undefined} />;
           })}
           <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 mt-4">
              <button className="text-[13px] font-bold text-muted-foreground flex items-center gap-2 hover:text-muted-foreground transition-colors">
                 <Icon.Plus className="size-4" /> Add value...
              </button>
              <span className="text-[11px] text-muted-foreground font-medium">{items.length} available</span>
           </div>
        </div>
      )}
    </div>
  );
}

function LineItemRow({ li, setFS }: { li: any; setFS?: (key: string) => (patch: any) => void }) {
  const [expanded, setExpanded] = useState(li.rowIndex === 2);
  const [localChoice, setLocalChoice] = useState("");
  const getField = (path: string) => li.fields.find((f: any) => f.dtoPath === path);
  
  const statusField = li.fields.find((f: any) => f.resolution !== "resolved") || li.fields[0];
  const resolution = statusField.resolution;

  return (
    <Fragment>
      <tr 
        onClick={() => setExpanded(!expanded)}
        className={`hover:bg-muted/50 transition-colors cursor-pointer ${expanded ? "bg-muted/30" : ""}`}
      >
        <td className="px-6 py-5 text-muted-foreground">
           <div className="flex items-center gap-4">
              <Icon.Chevron className={`size-4 transition-transform ${expanded ? "rotate-0" : "-rotate-90"}`} />
              <span className="text-[14px] font-medium text-zinc-900">{li.rowIndex}</span>
           </div>
        </td>
        <td className="px-6 py-5 text-[14px] font-bold text-indigo-600/80">{getField("productNumber")?.resolvedValue}</td>
        <td className="px-6 py-5 text-[14px] font-bold text-zinc-900">{getField("productDescription")?.resolvedValue}</td>
        <td className="px-6 py-5 text-[14px] font-bold text-zinc-900 text-center">{getField("quantity")?.resolvedValue}</td>
        <td className="px-6 py-5 text-[14px] font-bold text-zinc-900 tabular-nums">
           ${Number(getField("productList")?.resolvedValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </td>
        <td className="px-6 py-5 text-[14px] font-medium text-muted-foreground italic">
           {getField("catalogCode")?.resolution === "resolved" ? getField("catalogCode")?.resolvedValue : getField("catalogCode")?.inputValue}
        </td>
        <td className="px-6 py-5">
           <ResolutionPill resolution={resolution} />
        </td>
      </tr>
      {expanded && (
        <tr>
           <td colSpan={7} className="px-12 pb-8 pt-2 bg-muted/30">
              <div className="space-y-4">
                 <p className="text-[13px] font-bold text-zinc-900">Select an option</p>
                 <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                       <span className="text-[14px] font-bold text-zinc-900">Catalog Code</span>
                       <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 text-orange-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                          <span className="size-1.5 rounded-full bg-orange-500" /> Needs Choice
                       </span>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                       <div>
                          <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Document Description</p>
                          <div className="bg-zinc-100 border border-zinc-100 rounded-lg px-3 py-2.5 text-[14px] text-muted-foreground font-medium">
                             {getField("catalogCode")?.inputValue}
                          </div>
                       </div>
                       <div>
                          <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest mb-2">OrderBahn Match</p>
                          <div className="relative">
                             <select 
                                value={localChoice}
                                onChange={(e) => setLocalChoice(e.target.value)}
                                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-[14px] text-zinc-900 focus:outline-none focus:border-zinc-300 appearance-none"
                             >
                                <option value="" disabled>Choose an option</option>
                                {getField("catalogCode")?.knownValues?.map((kv: any) => (
                                   <option key={kv.id} value={kv.label}>{kv.label}</option>
                                ))}
                             </select>
                             <Icon.Chevron className="absolute right-3 top-3.5 size-4 text-muted-foreground pointer-events-none" />
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center justify-end gap-4 mt-6">
                        <button onClick={() => setLocalChoice("")} className="text-muted-foreground hover:text-muted-foreground text-[13px] font-semibold transition-colors">Cancel</button>
                        <button 
                            disabled={!localChoice}
                            onClick={() => {
                                setFS?.(`li:${li.rowIndex}:catalogCode`)({ effectiveResolution: 'resolved' });
                                setExpanded(false);
                            }} 
                            className={`bg-[#0f8b18] hover:bg-green-800 text-white px-4 py-1.5 rounded-md text-[13px] font-semibold flex items-center gap-1.5 transition-colors ${!localChoice ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                            <Icon.Check className="size-3.5" /> Accept
                        </button>
                    </div>
                 </div>
              </div>
           </td>
        </tr>
      )}
    </Fragment>
  );
}

// ---------------------------------------------------------------------
// Object Field Group (Recursive)
// ---------------------------------------------------------------------
function ObjectFieldGroup({ field, fieldState, setFS, keyPrefix }: any) {
  const children = field.children || [];
  return (
    <div className={`rounded-xl border border-zinc-200 overflow-hidden mb-4 ${field.isExtra ? "bg-white" : "bg-muted/30"}`}>
      <div className="px-4 py-3 flex items-center gap-3 border-b border-zinc-100 bg-white">
        {field.isExtra ? (
           <div className="size-4 rounded bg-[#d6f22e] flex items-center justify-center text-zinc-900 shrink-0">
              <Icon.Check className="size-3" strokeWidth={3} />
           </div>
        ) : (
           <div className="flex items-center justify-center size-8 rounded-lg bg-zinc-100 text-muted-foreground shrink-0">
              <Icon.Folder className="size-4" />
           </div>
        )}
        <span className="text-[14px] font-bold text-zinc-900">{field.displayName}</span>
        {field.required && (
            <span className="inline-flex items-center rounded-full bg-red-100 text-red-600 px-2.5 py-0.5 text-[10px] font-medium ml-1">Required</span>
        )}
        <span className="text-[11px] text-muted-foreground ml-auto">{children.length} fields</span>
      </div>
      <div className="p-3 space-y-2">
         {children.map((child: any) => {
            if (field.isExtra) {
               const key = `${keyPrefix}:${child.dtoPath}`;
               return (
                  <div key={child.dtoPath} className="flex items-center justify-between gap-4 py-1 px-1">
                     <span className="text-[13px] font-medium text-muted-foreground">{child.displayName}</span>
                     <input 
                        className="w-[65%] bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[14px] text-zinc-900 focus:outline-none focus:border-zinc-400 transition-colors"
                        value={fieldState[key]?.overrideValue ?? child.resolvedValue}
                        onChange={(e) => setFS(key)({ overrideValue: e.target.value, effectiveResolution: "resolved", isDirty: true })}
                     />
                  </div>
               );
            }
            return (
              <FieldRow
                key={child.dtoPath}
                field={child}
                state={fieldState[`${keyPrefix}:${child.dtoPath}`]}
                setState={setFS(`${keyPrefix}:${child.dtoPath}`)}
                compact
              />
            );
         })}
      </div>
    </div>
  );
}

// =====================================================================
// Progress & Sidebar
// =====================================================================
function ProgressRing({ pct }: { pct: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const o = c - (pct / 100) * c;
  return (
    <div className="ring-wrap">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} stroke="#EBECEE" strokeWidth="8" fill="none" />
        <circle
          cx="36" cy="36" r={r}
          stroke="#0B0B0C" strokeWidth="8" fill="none"
          strokeDasharray={c} strokeDashoffset={o}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 400ms cubic-bezier(.2,.7,.2,1)" }}
          transform="rotate(-90 36 36)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[16px] font-bold text-zinc-900 leading-none">{pct}%</span>
        <span className="text-[9px] text-muted-foreground mt-0.5 font-bold tracking-wider uppercase">Ready</span>
      </div>
    </div>
  );
}

function SegmentedBar({ summary }: any) {
  const total = summary.total || 1;
  const seg = (count: number, cls: string) => (
    <span className={cls} style={{ width: `${(count / total) * 100}%` }} />
  );
  return (
    <div className="seg">
      {summary.resolved > 0 && seg(summary.resolved, "bg-green-500")}
      {summary.aiUncertain > 0 && seg(summary.aiUncertain, "bg-amber-400")}
      {summary.unresolved > 0 && seg(summary.unresolved, "bg-red-500")}
      {summary.unmapped > 0 && seg(summary.unmapped, "bg-zinc-300")}
    </div>
  );
}

// =====================================================================
// Main Component
// =====================================================================
interface CreateRecordModalProps {
    isOpen: boolean
    onClose: () => void
    document: any
    onConvert: (docId: string, convertTo: 'po' | 'ack') => void
}

export default function CreateRecordModal({ isOpen, onClose, document, onConvert }: CreateRecordModalProps) {
  const [fieldState, setFieldState] = useState<any>({});
  const [view, setView] = useState("document");
  const [showPublishToast, setShowPublishToast] = useState(false);
  
  // Flatten preflight for calculations
  const flat = useMemo(() => {
      const out: any[] = [];
      PREFLIGHT.sections.forEach((s: any) => {
          s.fields.forEach((f: any) => {
              if (f.isObject) f.children.forEach((c: any) => out.push({...c, key: `h:${s.id}:${f.dtoPath}:${c.dtoPath}`}));
              else if (f.isCollection) f.items.forEach((item: any, i: number) => out.push({...item, key: `h:${s.id}:${f.dtoPath}:${i}`}));
              else out.push({...f, key: `h:${s.id}:${f.dtoPath}`});
          });
      });
      PREFLIGHT.lineItems.forEach((li: any) => {
          li.fields.forEach((f: any) => {
              out.push({...f, key: `li:${li.rowIndex}:${f.dtoPath}`});
          });
      });
      return out;
  }, []);

  const summary = useMemo(() => {
    const counts = { total: flat.length, resolved: 0, unresolved: 0, aiUncertain: 0, unmapped: 0 };
    flat.forEach(f => {
        const st = fieldState[f.key];
        const r = (st && st.effectiveResolution) || f.resolution;
        if (r === "resolved") counts.resolved++;
        else if (r === "unresolved" || r === "coercion_error") counts.unresolved++;
        else if (r === "ai_suggested" || r === "ai_uncertain" || r === "partial") counts.aiUncertain++;
        else if (r === "unmapped") counts.unmapped++;
    });
    return { ...counts, valid: counts.unresolved === 0 && counts.aiUncertain === 0 };
  }, [fieldState, flat]);

  const pct = Math.round((summary.resolved / summary.total) * 100);

  const setFS = (key: string) => (patch: any) =>
    setFieldState((prev: any) => ({ ...prev, [key]: { ...(prev[key] || {}), ...patch } }));

  if (!document) return null;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 modal-backdrop" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-6">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 translate-y-4 scale-95"
          >
            <DialogPanel className="anim-fadeup relative w-full max-w-[960px] h-[85vh] rounded-[24px] bg-white shadow-[0_30px_80px_-20px_rgba(11,11,12,0.35)] overflow-hidden flex flex-col text-zinc-900">
              
              <div className="flex-1 overflow-y-auto scroll-polish">
                {/* Header Section */}
                <div className="px-10 pt-10 pb-6 space-y-6 bg-white">
                  {/* Top Row: Title, Avatar, Close */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <h2 className="text-[28px] font-bold text-zinc-900 tracking-tight">OrderBahn — Purchase Order</h2>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 text-muted-foreground hover:text-zinc-900 transition-colors">
                      <Icon.Close className="size-7" />
                    </button>
                  </div>

                  {/* Subtitle */}
                  <div className="text-[16px] text-muted-foreground font-medium -mt-4">
                    Draft PO-001 | Created Apr 22, 2026
                  </div>

                  {/* Warning Banner */}
                  <div className="bg-amber-50/40 border border-amber-100/60 rounded-2xl p-4 flex items-start gap-3">
                    <Icon.Warn className="size-5 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-[14px] text-amber-800/90 font-medium leading-normal">
                      Review how your data maps into OrderBahn. Fields that match automatically are shown, while others need your confirmation.
                    </p>
                  </div>

                  {/* Progress Section */}
                  <div className="bg-muted/50 border border-zinc-100 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[18px] font-bold text-zinc-900">Preflight</span>
                        <span className="text-[14px] text-muted-foreground font-medium">{summary.resolved}/{summary.total} ready</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[14px] font-bold text-zinc-900">{pct}%</span>
                        <span className="text-[12px] text-muted-foreground font-medium">ready</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* Stepper & Refresh */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => setView("document")}
                        className="flex items-center gap-3 group"
                      >
                        <div className={`size-8 rounded-full flex items-center justify-center font-bold text-[14px] transition-colors ${view === "document" ? "bg-[#E6F993] text-zinc-900" : "bg-zinc-100 text-muted-foreground group-hover:bg-zinc-200"}`}>1</div>
                        <span className={`text-[16px] font-bold transition-colors ${view === "document" ? "text-zinc-900" : "text-muted-foreground group-hover:text-muted-foreground"}`}>Header Fields</span>
                      </button>
                      <Icon.Arrow className="size-5 text-zinc-300" />
                      <button 
                        onClick={() => setView("lineItems")}
                        className="flex items-center gap-3 group"
                      >
                        <div className={`size-8 rounded-full flex items-center justify-center font-bold text-[14px] transition-colors ${view === "lineItems" ? "bg-[#E6F993] text-zinc-900" : "bg-zinc-100 text-muted-foreground group-hover:bg-zinc-200"}`}>2</div>
                        <span className={`text-[16px] font-bold transition-colors ${view === "lineItems" ? "text-zinc-900" : "text-muted-foreground group-hover:text-muted-foreground"}`}>Line Items</span>
                      </button>
                    </div>
                    <button className="flex items-center gap-2 bg-[#E6F993] hover:bg-[#d6f22e] text-zinc-900 px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all shadow-sm active:scale-95">
                      <Icon.Refresh className="size-4" />
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="px-10 py-8 bg-[#fbfbfb] border-t border-zinc-100">
                    {view === "document" ? (
                        <div className="w-full space-y-2">
                             {PREFLIGHT.sections.map((section: any) => (
                                <div key={section.id}>
                                    <Eyebrow>{section.label}</Eyebrow>
                                    {section.isExtraSection && (
                                       <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 text-[12.5px] text-blue-600 mb-6 flex gap-3 items-center">
                                          <Icon.Info className="size-5 text-blue-500 shrink-0" />
                                          <div>Catalog fields outside the standard Purchase Order schema. Forwarded as-is without auto-matching.</div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 gap-2.5">
                                        {section.fields.map((f: any) => {
                                            if (f.isObject) return <ObjectFieldGroup key={f.dtoPath} field={f} fieldState={fieldState} setFS={setFS} keyPrefix={`h:${section.id}:${f.dtoPath}`} />;
                                            if (f.isCollection) return <CollectionFieldGroup key={f.dtoPath} field={f} fieldState={fieldState} setFS={setFS} sectionId={section.id} />;
                                            return (
                                                <FieldRow
                                                    key={f.dtoPath}
                                                    field={f}
                                                    state={fieldState[`h:${section.id}:${f.dtoPath}`]}
                                                    setState={setFS(`h:${section.id}:${f.dtoPath}`)}
                                                />
                                            );
                                        })}
                                    </div>
                                    <div className="h-10" />
                                </div>
                             ))}
                        </div>
                    ) : (
                        <div className="space-y-4 w-full">
                            <div className="rounded-xl border border-zinc-200 overflow-hidden shadow-xl bg-white">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-muted border-b border-zinc-200">
                                        <tr>
                                            <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">#</th>
                                            <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Product</th>
                                            <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Description</th>
                                            <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-center">Qty</th>
                                            <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">List</th>
                                            <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Catalog Code</th>
                                            <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {PREFLIGHT.lineItems.map((li: any) => (
                                            <LineItemRow key={li.rowIndex} li={li} setFS={setFS} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-[12px] text-muted-foreground italic px-2">Click any row to expand and resolve issues.</p>
                        </div>
                    )}
                </div>
              </div>

              <footer className="h-[88px] px-10 flex items-center justify-between border-t border-zinc-200 bg-[#FAFAFA] shrink-0">
                <button onClick={onClose} className="text-[14px] font-bold text-muted-foreground hover:text-zinc-900 transition-colors">Cancel</button>
                <div className="flex items-center gap-4">
                  <button
                    disabled={!summary.valid}
                    onClick={() => {
                      onConvert(document.id, 'po');
                      setShowPublishToast(true);
                      setTimeout(() => setShowPublishToast(false), 4000);
                    }}
                    className={`h-[42px] px-7 rounded-full font-bold text-[13px] flex items-center gap-2 transition-all active:scale-[0.97] shadow-lg ${summary.valid ? "bg-[#E6F993] hover:bg-[#d6f22e] text-zinc-900 shadow-[#E6F993]/30" : "bg-zinc-100 text-muted-foreground cursor-not-allowed shadow-none"}`}
                  >
                    Publish
                    <Icon.Arrow className="size-4.5" />
                  </button>
                </div>
              </footer>

            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>

      {/* Publish Success Toast */}
      {showPublishToast && (
        <div className="fixed bottom-8 right-8 z-[200] flex items-center gap-4 px-6 py-4 bg-[#ECFDF5] border-l-4 border-green-600 shadow-2xl rounded-sm animate-in slide-in-from-right fade-in duration-500">
          <div className="h-6 w-6 rounded-full border-2 border-green-600 flex items-center justify-center shrink-0">
            <Icon.Check className="size-4 text-green-600" strokeWidth={3} />
          </div>
          <p className="text-sm font-medium text-green-900 pr-8">
            Record created successfully in OrderBahn.
          </p>
          <button
            onClick={() => setShowPublishToast(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-green-800/60 hover:text-green-900 transition-colors"
          >
            <Icon.X className="size-4" />
          </button>
        </div>
      )}
    </Transition>
  );
}
