/**
 * Server-rendered JSON-LD. Emitted in the initial HTML (not injected after load).
 * `<` is escaped so content can never close the script tag.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
