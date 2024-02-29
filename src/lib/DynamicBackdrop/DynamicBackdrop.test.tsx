import { render, screen } from "@testing-library/react";
import DynamicBackdrop from ".";

test("render", async () => {
  render(<DynamicBackdrop imageSrc="" />);
  const element = screen.getByTestId("dynamic-backdrop");
  expect(element).toBeInTheDocument();
});
