# 👥 Contributing Guide — 4-Member Team

## Team Roles

| Member | GitHub Username | Role | Responsibility |
|---|---|---|---|
| Member 1 | `@member1` | Backend Lead | Spring Boot, REST APIs, JPA, Security |
| Member 2 | `@member2` | Frontend Lead | ReactJS, Context API, Routing, UI |
| Member 3 | `@member3` | DevOps / QA | CI/CD, Docker, Testing, Branch Management |
| Member 4 | `@member4` | Full Stack / PM | Architecture, Code Review, Production Deploy |

---

## 🌿 Branch Naming Convention

```
feature/backend-user-authentication    ← Backend feature
feature/frontend-cart-drawer           ← Frontend feature
fix/backend-jwt-expiry-bug             ← Bug fix
chore/update-dependencies              ← Maintenance
docs/update-api-docs                   ← Documentation
test/add-order-service-tests           ← Tests only
ci/improve-docker-build                ← CI/CD changes
```

---

## 📝 Commit Message Convention (Conventional Commits)

All commits must follow this format:
```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `test` — Adding tests
- `refactor` — Code refactor (no feature/fix)
- `chore` — Build, dependencies
- `ci` — CI/CD changes
- `perf` — Performance improvement

**Examples:**
```
feat(backend): add product search with keyword filter
fix(frontend): resolve cart item quantity not updating
test(backend): add JUnit tests for OrderService
ci: add OWASP dependency check to CI pipeline
docs: update deployment guide with Railway setup steps
```

---

## 🔄 Development Workflow

### For a New Feature

```bash
# 1. Start from latest dev
git checkout dev
git pull origin dev

# 2. Create feature branch
git checkout -b feature/backend-product-filter
# OR
git checkout -b feature/frontend-search-bar

# 3. Develop + commit frequently
git add .
git commit -m "feat(backend): add product category filter endpoint"

# 4. Push and open PR → dev
git push origin feature/backend-product-filter
# Open PR on GitHub with the PR template filled out

# 5. After code review + CI passes → merge to dev
```

### Promoting to Staging and Production

```bash
# Member 3: Promote dev → staging (when dev is stable)
git checkout staging
git merge dev
git push origin staging
# Staging deploys automatically via GitHub Actions

# Member 4: Promote staging → main (after testing staging)
# Open PR on GitHub: staging → main
# Requires 2 approvals (Member 3 + Member 4)
# Production deploys automatically after merge
```

---

## 🧪 Testing Requirements

### Backend (Java)
- Every new service method needs a unit test
- Use JUnit 5 + Mockito (as per curriculum)
- Minimum coverage: 60% (enforced in CI)

```java
@Test
@DisplayName("Should return product when valid ID given")
void getProductById_ShouldReturnProduct() {
    // Arrange
    when(repo.findById(1L)).thenReturn(Optional.of(product));
    // Act
    Product result = service.getProductById(1L);
    // Assert
    assertThat(result.getName()).isEqualTo("Test Product");
}
```

### Frontend (React)
- Test components with React Testing Library
- Test user interactions (clicks, form fills)
- Mock API calls with MSW or jest.fn()

---

## 🚫 What NOT to Commit

```gitignore
# Never commit these:
*.env
*.env.local
application-local.properties
target/
node_modules/
*.log
*.jar
```

Run `git status` before committing. If you see any of the above, add them to `.gitignore` first.

---

## 🆘 Getting Help

- Raise a GitHub Issue using the bug/feature templates
- Tag the relevant team member in the issue
- Use GitHub Discussions for questions
- Slack/WhatsApp group for urgent issues
