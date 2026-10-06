import i18n from "@/lib/i18n";

describe("internationalized interface", () => {
  it("switches supported language resources", async () => {
    await i18n.changeLanguage("es");
    expect(i18n.t("feed")).toBe("Inicio");
    expect(i18n.t("signIn")).toBe("Iniciar sesión");
    await i18n.changeLanguage("en");
    expect(i18n.t("feed")).toBe("Feed");
  });
});
