import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import ContentCard from "@/components/ContentCard";
import { makeStore } from "@/store";
import { makeItem } from "./testUtils";

function renderCard(props: React.ComponentProps<typeof ContentCard>) {
  return render(<Provider store={makeStore()}><ContentCard {...props} /></Provider>);
}

describe("ContentCard", () => {
  it.each([
    ["news", "Read More"],
    ["movie", "Play Now"],
    ["social", "View Post"],
  ] as const)("shows the %s call-to-action", (type, label) => {
    renderCard({ item: makeItem({ type }), isFavorite: false, onToggleFavorite: jest.fn() });
    const link = screen.getByRole("link", { name: new RegExp(label) });
    expect(link).toHaveAttribute("href", "https://example.com/1");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("reflects and toggles favorite state accessibly", async () => {
    const onToggle = jest.fn();
    const item = makeItem();
    const store = makeStore();
    const view = (favorite: boolean) => <Provider store={store}><ContentCard item={item} isFavorite={favorite} onToggleFavorite={onToggle} /></Provider>;
    const { rerender } = render(view(false));
    const btn = screen.getByRole("button", { name: /add test headline to favorites/i });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(btn);
    expect(onToggle).toHaveBeenCalledWith(item);
    rerender(view(true));
    expect(screen.getByRole("button", { name: /remove test headline from favorites/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps dismiss and recommendation actions off the resting card while retaining keyboard access", () => {
    const { container } = renderCard({ item: makeItem(), isFavorite: false, onToggleFavorite: jest.fn(), onDismiss: jest.fn(), onRecommendLess: jest.fn(), swipeEnabled: true });
    const dismiss = screen.getByRole("button", { name: /remove test headline from the feed/i });
    const less = screen.getByRole("button", { name: /show fewer items like test headline/i });
    expect(dismiss.className).toContain("sr-only");
    expect(less.className).toContain("sr-only");
    expect(container.querySelector(".swipe-reveal")).toHaveAttribute("aria-hidden", "true");
  });

  it("renders keyboard reorder controls only when onMove is given", async () => {
    const onMove = jest.fn();
    const store = makeStore();
    const props = { item: makeItem(), isFavorite: false, onToggleFavorite: jest.fn() };
    const { rerender } = render(<Provider store={store}><ContentCard {...props} /></Provider>);
    expect(screen.queryByRole("button", { name: /move .* up/i })).toBeNull();
    rerender(<Provider store={store}><ContentCard {...props} onMove={onMove} /></Provider>);
    await userEvent.click(screen.getByRole("button", { name: /move .* down/i }));
    expect(onMove).toHaveBeenCalledWith("news-1", 1);
  });

  it("requires a local profile before opening a news article", async () => {
    const user = userEvent.setup();
    renderCard({ item: makeItem(), isFavorite: false, onToggleFavorite: jest.fn() });
    await user.click(screen.getByRole("link", { name: /Read More/ }));
    expect(screen.getByRole("dialog", { name: "Sign in to continue" })).toBeVisible();
    await user.type(screen.getByLabelText("Display name"), "Avery");
    await user.type(screen.getByLabelText("Email address"), "avery@example.com");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByRole("link", { name: "Continue to article" })).toHaveAttribute("href", "https://example.com/1");
    expect(screen.getByText(/does not create a server account/i)).toBeVisible();
  });

  it("does not expose sample source labels or a generated news image", () => {
    renderCard({ item: makeItem({ sample: true, source: "Sample data", image: null }), isFavorite: false, onToggleFavorite: jest.fn() });
    expect(screen.queryByText(/sample data/i)).toBeNull();
    expect(screen.getByRole("img", { name: "Article image unavailable" })).toBeVisible();
  });
});
