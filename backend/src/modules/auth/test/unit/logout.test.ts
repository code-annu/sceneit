import AuthService from "../../auth.service";

describe("Logout", () => {
  const authenticatedUser = {
    id: "user-123",
    username: "peter",
    email: "peter@gmail.com",
    passwordHash: "12345678",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const foundSession = {
    id: "session-123",
    user: authenticatedUser,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isRevoked: false,
  };

  const sessionRepo = {
    findById: vi.fn(),
    update: vi.fn(),
    revoke: vi.fn(),
  };

  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService(
      null as any,
      null as any,
      sessionRepo as any,
      null as any,
    );
  });

  it("should logout successfully", async () => {
    sessionRepo.findById.mockResolvedValue(foundSession);
    const result = await authService.logout({
      sessionId: foundSession.id,
      userId: authenticatedUser.id,
    });

    expect(result).toBeUndefined();
    expect(sessionRepo.findById).toHaveBeenCalledWith(foundSession.id);
    expect(sessionRepo.revoke).toHaveBeenCalledWith(foundSession.id);
  });

  it("should throw session not found", async () => {
    sessionRepo.findById.mockResolvedValue(null);
    const result = authService.logout({
      sessionId: foundSession.id,
      userId: authenticatedUser.id,
    });

    expect(result).rejects.toThrow("Session not found");
  });
});
