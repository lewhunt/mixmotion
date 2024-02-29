import { render, screen } from "@testing-library/react";
import { MixmotionPlayer } from ".";

test("render", async () => {
  render(<MixmotionPlayer url="" />);
  const element = screen.getByTestId("mixmotion-player");
  expect(element).toBeInTheDocument();
});
