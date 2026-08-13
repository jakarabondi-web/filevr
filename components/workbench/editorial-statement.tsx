import { d, STATEMENT } from "@/components/workbench/geometry";

/**
 * The page's level-1 heading, plus its supporting line.
 *
 * Desktop and below-desktop are separate subtrees (absolute composition vs
 * flow), and only one is ever rendered — the other is `display: none` and so
 * is dropped from the accessibility tree. To also keep exactly one `<h1>`
 * *tag* in the DOM, the desktop variant owns the tag and the flow variant
 * carries the same semantics via `role="heading" aria-level={1}`.
 */
export function EditorialStatement({ scaled = false }: { scaled?: boolean }) {
  if (!scaled) {
    return (
      <div className="px-5 pt-6 min-[480px]:px-7 lg:px-10">
        <p
          role="heading"
          aria-level={1}
          className="font-display uppercase text-ink text-[50px] leading-[0.9] tracking-[-0.045em] sm:text-[62px] lg:text-[72px] lg:leading-[0.88]"
        >
          Files in.
          <br />
          Finished
          <br />
          work out.
        </p>
        <p className="mt-4 max-w-[290px] text-xl font-semibold leading-[1.3] text-ink lg:text-[26px] lg:leading-[1.2]">
          One workspace for
          <br />
          every document job.
        </p>
      </div>
    );
  }

  return (
    <>
      <h1
        className="absolute font-display uppercase text-ink"
        style={{
          left: d(STATEMENT.left),
          top: d(STATEMENT.top),
          width: d(STATEMENT.width),
          fontSize: d(STATEMENT.h1Size),
          lineHeight: 0.88,
          letterSpacing: "-0.045em",
        }}
      >
        Files in.
        <br />
        Finished
        <br />
        work out.
      </h1>
      <p
        className="absolute font-semibold text-ink"
        style={{
          left: d(STATEMENT.left),
          top: d(STATEMENT.copyTop),
          maxWidth: d(STATEMENT.copyWidth),
          fontSize: d(STATEMENT.copySize),
          lineHeight: 1.2,
        }}
      >
        One workspace for
        <br />
        every document job.
      </p>
    </>
  );
}
