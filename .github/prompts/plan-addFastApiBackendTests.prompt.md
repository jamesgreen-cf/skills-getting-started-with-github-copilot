## Plan: Add FastAPI Backend Tests

Add a dedicated tests directory for backend API coverage using pytest and FastAPI TestClient, with deterministic state reset around the in-memory activities store. Structure every test with the AAA pattern (Arrange, Act, Assert) so endpoint behavior stays explicit, readable, and consistent while validating list, signup, and unregister flows.

**Steps**
1. Phase 1: Test foundation
2. Update requirements.txt to include pytest (required) so tests run in fresh environments and align with the selected testing framework.
3. Expand pytest.ini with testpaths and any minimal pytest defaults needed for consistent discovery. Depends on step 2.
4. Create a new tests directory and baseline test package/module layout for backend-only tests. Depends on step 3.
5. Add a testing convention note in the suite: every test follows AAA with explicit Arrange, Act, Assert sections in that order. Depends on step 4.
6. Phase 2: Shared fixtures and isolation
7. Add tests/conftest.py with a TestClient fixture bound to src.app:app and an autouse fixture that deep-copies and restores the global activities data for each test. Depends on step 4.
8. Confirm fixture isolation by ensuring one test mutation cannot leak into another test run. Depends on step 7.
9. Phase 3: Endpoint tests (AAA structured)
10. Add root route test(s) for redirect behavior from / to /static/index.html, using AAA layout. Depends on step 7.
11. Add activities listing tests for GET /activities, including response status and schema/shape checks for each activity object, using AAA layout. Depends on step 7; parallel with step 10.
12. Add signup tests for POST /activities/{activity_name}/signup using AAA layout:
13. valid signup returns 200 and appends participant
14. unknown activity returns 404
15. duplicate email returns 400 using the current guard
16. Depends on step 7; parallel with steps 10-11.
17. Add unregister tests for DELETE /activities/{activity_name}/unregister using AAA layout:
18. valid unregister returns 200 and removes participant
19. unknown activity returns 404
20. missing participant returns 404
21. Depends on step 7; parallel with steps 10-12.
22. Phase 4: Verification and polish
23. Run pytest and fix any isolation/order dependencies until suite is green and order-independent. Depends on steps 10-21.
24. Perform a readability review to ensure each test clearly separates Arrange, Act, and Assert and avoids mixed assertions in setup/action blocks. Depends on step 23.
25. Optional polish: light parametrization for repeated 404 scenarios if readability remains high and AAA clarity is preserved. Depends on step 23.

**Relevant files**
- /workspaces/skills-getting-started-with-github-copilot/src/app.py — source of endpoint behavior to verify: GET /, GET /activities, POST signup, DELETE unregister.
- /workspaces/skills-getting-started-with-github-copilot/requirements.txt — add pytest dependency.
- /workspaces/skills-getting-started-with-github-copilot/pytest.ini — configure discovery defaults for tests directory.
- /workspaces/skills-getting-started-with-github-copilot/tests/ (new) — backend test modules grouped by endpoint.
- /workspaces/skills-getting-started-with-github-copilot/tests/conftest.py (new) — TestClient and state reset fixtures.

**Verification**
1. Verify requirements.txt contains pytest, then run pytest -q from repository root and confirm all tests pass.
2. Re-run pytest -q twice to confirm deterministic behavior and no global-state leakage.
3. Spot-check that signup and unregister tests assert both HTTP status and participant list mutation.
4. Confirm each test is clearly split into Arrange, Act, Assert sections in order.
5. Confirm tests only cover backend API behavior and do not rely on frontend static files.

**Decisions**
- Included scope: backend API tests only, stored in a separate tests directory.
- Included scope: current app behavior validation (including duplicate-signup rejection and unregister rules).
- Decision: enforce AAA (Arrange-Act-Assert) structure as the default pattern for every backend test.
- Excluded scope: new business rules not currently implemented (for example capacity enforcement or email-format validation).
- Decision: pytest is the required test runner for this scope and must be added to requirements.txt to keep setup simple for contributors and CI.

**Further Considerations**
1. If stronger confidence is desired, add a small set of parametrized cases for invalid activity names across signup and unregister.
2. If future endpoints are added, follow the same pattern: endpoint-specific module plus shared fixture reuse from conftest.
3. If activity initialization grows, consider extracting initial seed data into a helper to simplify fixture resets.
