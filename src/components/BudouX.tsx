import { Fragment, memo } from "react";
import { jaModel, Parser } from "budoux";

const parser = new Parser(jaModel);

/** Keep the original text intact while offering breaks at phrase boundaries. */
export const BudouX = memo(function BudouX({ children }: { children: string }) {
  return (
    <span className="budoux">
      {parser.parse(children).map((phrase, index) => (
        <Fragment key={index}>
          {index > 0 && <wbr />}
          {phrase}
        </Fragment>
      ))}
    </span>
  );
});
