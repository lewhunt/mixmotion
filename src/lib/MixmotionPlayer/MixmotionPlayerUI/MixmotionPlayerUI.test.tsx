import { render, screen } from "@testing-library/react";
import { MixmotionPlayerUI } from "./MixmotionPlayerUI";
import { ButtonProps } from "../types";

test("render", () => {
  render(<MixmotionPlayerUI />);
  const element = screen.getByTestId("mixmotion-player-ui");
  expect(element).toBeInTheDocument();
});

test("renders default buttons", () => {
  const { getByTestId } = render(<MixmotionPlayerUI />);

  expect(getByTestId("previous")).toBeInTheDocument();
  expect(getByTestId("playpause")).toBeInTheDocument();
  expect(getByTestId("next")).toBeInTheDocument();
});

test("renders progress bar", () => {
  const { getByTestId } = render(<MixmotionPlayerUI />);
  expect(getByTestId("progress-bar")).toBeInTheDocument();
});

test("renders custom buttons", () => {
  const customButtons: ButtonProps[] = [
    { action: "previous" },
    { action: "playpause" },
    { action: "next" },
    { action: "custom", label: "More" },
  ];

  const { getByTestId, getByText } = render(
    <MixmotionPlayerUI customButtons={customButtons} />
  );

  expect(getByTestId("previous")).toBeInTheDocument();
  expect(getByTestId("playpause")).toBeInTheDocument();
  expect(getByTestId("next")).toBeInTheDocument();
  expect(getByTestId("custom")).toBeInTheDocument();
  expect(getByText("More")).toBeInTheDocument();
});
