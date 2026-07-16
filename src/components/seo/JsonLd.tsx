// Server component that emits a schema.org JSON-LD <script>. Rendering it on the
// server keeps the structured data in the initial HTML, where crawlers and AI
// engines read it. Accepts one node or an array of nodes.
//
// The `<` escape prevents a "</script>" sequence inside any string value from
// breaking out of the script tag (the standard JSON-LD injection safeguard).

export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  );
}
