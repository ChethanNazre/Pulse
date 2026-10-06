import auth, { signInLocally, signOutLocally, hydrateAuth } from "@/store/authSlice";

describe("mock authentication", () => {
  it("stores a local profile and signs out cleanly", () => {
    const signedIn = auth(undefined, signInLocally({ name: "Avery", email: "avery@example.com" }));
    expect(signedIn.profile).toEqual({ name: "Avery", email: "avery@example.com" });
    expect(auth(signedIn, signOutLocally()).profile).toBeNull();
  });

  it("hydrates absent or saved profiles safely", () => {
    expect(auth(undefined, hydrateAuth(undefined)).profile).toBeNull();
    expect(auth(undefined, hydrateAuth({ name: "Avery", email: "avery@example.com" })).profile?.name).toBe("Avery");
  });
});
