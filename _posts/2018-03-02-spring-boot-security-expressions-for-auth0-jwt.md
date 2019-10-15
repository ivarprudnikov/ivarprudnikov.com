---
layout: post
title: "Spring Boot security expressions for Auth0 JWT"
image: /assets/spring-boot-with-auth0.jpeg
image_caption: "Logos: Spring, Spring Boot and Auth0"
toc: true
---

Usage of separate authorization server comes with a bit of challenges, first you want to be able to login with a client without using session then you need to share this authentication with your API server. First issue could be solved by using services like [Auth0](https://auth0.com/), they provide user management, access control and authentication libraries for websites; second issue is a bit more complex as your api would need to validate requests that come from the website and make sure that user has access to resource she is requesting.

## Authentication

Here I’ll go through example of using [JWT(JSON Web Token)](https://en.wikipedia.org/wiki/JSON_Web_Token) which was obtained from Auth0 servers by the client and passed to a spring boot application in a `Authorization` header as a `Bearer` token. Token validation is lifted by [Auth0 libraries](https://github.com/auth0/auth0-spring-security-api) which [set authentication in spring security context](https://docs.spring.io/spring-security/site/docs/current/reference/htmlsingle/#tech-intro-authentication).

Examples are shown using [Groovy language](http://groovy-lang.org/) which is achieved by adding [related gradle plugin](https://docs.gradle.org/current/userguide/groovy_plugin.html), but Java would look very much the same.

* Spring Boot version 1.5.10.RELEASE
* Auth0 auth0:1.5.0 auth0-spring-security-api:1.0.0

### Validate JWT

```yaml
# src/main/resources/application.yml
auth0:
  issuer: https://your-domain.eu.auth0.com/
  apiAudience: http://your-audience
```

```groovy
// src/main/groovy/yourpackage/WebSecurityConfig.groovy
@Configuration
@EnableWebSecurity
class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    @Value('${auth0.apiAudience}')
    private String audience

    @Value('${auth0.issuer}')
    private String issuer

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        JwtWebSecurityConfigurer
                .forRS256(audience, issuer)
                .configure(http)
                .authorizeRequests()
                .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .antMatchers("/").permitAll()
                .antMatchers("/**").authenticated()
    }
}
```

Above configuration will expect [JWT tokens signed with RS256](https://tools.ietf.org/html/rfc7518#section-3) which is an asymmetric type of encryption, meaning that we can only verify tokens without being able to create them.

```groovy
// src/main/groovy/yourpackage/IndexController.groovy
@RestController
class IndexController {

    @ResponseBody
    @RequestMapping("/")
    String index() {
        return "I am public"
    }

    @RequestMapping("/api/whoami")
    Object user() {
        Authentication auth = SecurityContextHolder.getContext()
                .getAuthentication()

        return [
          principal  : auth.principal,
          authorities: auth.authorities,
          credentials: auth.credentials,
          details    : auth.details
        ]
    }
}
```

To test the contents of a token you could print out Authentication which is populated with the token details, in our example I’ve set up `/api/whoami` endpoint and it would spit out similar:

```json
{
  "principal": "google-oauth2|10317865287365028403",
  "authorities": [
    { "authority": "openid" },
    { "authority": "profile" },
    { "authority": "email" }
  ],
  "credentials": "...",
  "details": {
    "header": "...",
    "payload": "...",
    "id": null,
    "type": "JWT",
    "signature": "...",
    "token": "...",
    "algorithm": "RS256",
    "subject": "google-oauth2|10317865287365028403",
    "notBefore": null,
    "contentType": null,
    "keyId": "...",
    "expiresAt": 1519950673000,
    "issuedAt": 1519943473000,
    "issuer": "https://your-domain.eu.auth0.com/",
    "audience": [
      "http://[your-audience](http://your-audience)",
      "https://your-domain.eu.auth0.com/userinfo"
    ],
    "claims": {
      ...
    }
  }
}
```

### Authorize based on JWT scopes

Auth0 allows you to add custom scopes and later authorize requests against them.

<div class="d-flex justify-content-center align-items-start mb-4">
  <figure class="flex-fill text-center figure">
    <img class="img-fluid" alt="auth0 ui scopes" src="/assets/auth0-ui-scopes.png" />
    <figcaption class="figure-caption">
      Add custom api scopes in Auth0.com
    </figcaption>
  </figure>
</div>

Scopes can be requested by any user, the same way you ask for them in OAuth flows. If you tried to read `/api/whoami` response example you might have seen the authorities user got: `openid` `profile` `email` , those were the scopes user asked for before authenticating; user would get more if he asked for custom ones. To restrict what scopes user has access to it is necessary to add some rules in _Auth0_.

It is then possible to restrict access to some endpoints in application:

```groovy
// src/main/groovy/yourpackage/WebSecurityConfig.groovy

//<...>
JwtWebSecurityConfigurer
    .forRS256(audience, issuer)
    // ...
    .antMatchers(HttpMethod.POST, "/api/appointment")
    .hasAuthority("write:appointments")
```

### Authorize based on JWT claims

If there is no way to ask for different scopes from client or there is a need to check additional details in JWT it is possible to write additional [security expressions](https://docs.spring.io/spring-security/site/docs/current/reference/htmlsingle/#el-access).

In my example JWT payload contains roles in a claim:

```json
{
  "[http://my-domain/roles](http://contentflue/roles)": {
    "content_manager": [
      "articles", "images"
    ]
  },
  ...
  "iat": 1519920051,
  "exp": 1519927251,
  "scope": "openid profile email"
}
```

Now I need to provide access to some functionality based on role claims. One thing to note is that claim has a very unique key `http://my-domain/roles` which is a requirement in Auth0 and recommended to be like that for avoidance of collisions.

As you might have spotted already, claims will appear in `authentication.details.claims` object and I am going to use those in custom method level security expression.

```groovy
// .../yourpackage/MethodSecurityConfig.groovy
@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
class MethodSecurityConfig extends GlobalMethodSecurityConfiguration {
    @Override
    protected MethodSecurityExpressionHandler createExpressionHandler() {
        final CustomMethodSecurityExpressionHandler expressionHandler = new CustomMethodSecurityExpressionHandler()
        expressionHandler.setPermissionEvaluator(new DenyAllPermissionEvaluator())
        return expressionHandler
    }
}
```

```groovy
// .../yourpackage/CustomMethodSecurityExpressionHandler.groovy
class CustomMethodSecurityExpressionHandler extends DefaultMethodSecurityExpressionHandler {
    private final AuthenticationTrustResolver trustResolver = new AuthenticationTrustResolverImpl()
    @Override
    protected MethodSecurityExpressionOperations createSecurityExpressionRoot(Authentication authentication, MethodInvocation invocation) {
        final CustomMethodSecurityExpressionRoot root = new CustomMethodSecurityExpressionRoot(authentication)
        root.setPermissionEvaluator(getPermissionEvaluator())
        root.setTrustResolver(this.trustResolver)
        root.setRoleHierarchy(getRoleHierarchy())
        root.setDefaultRolePrefix(getDefaultRolePrefix())
        return root
    }
}
```

```groovy
// .../yourpackage/JwtTransformer.groovy
class JwtTransformer {
    private static final JsonSlurper jsonSlurper = new JsonSlurper()
    static JWTPayload toJWTPayload(String jwt){
        final List parts = jwt.tokenize('.')
        if(parts.size() < 2){
            return null
        }
        Map jwtBody
        try {
            String payloadJson = StringUtils.newStringUtf8(Base64.decodeBase64(parts[1]))
            jwtBody = (Map) jsonSlurper.parseText(payloadJson)
        } catch (NullPointerException e) {
            throw new RuntimeException("The UTF-8 Charset isn't initialized.", e)
        }
        return new JWTPayload(jwtBody)
    }
}
```

```groovy
// .../yourpackage/JWTPayload.groovy
class JWTPayload {
    public static final String ROLES_KEY = "[http://my-domain/roles](http://contentflue/roles)"
    final Map<String, List<String>> roles
    final List<String> contentManagerTypes
    
    JWTPayload(Map<String, Object> jwtPayload = [:]){
        roles = jwtPayload[ROLES_KEY]
        contentManagerSpaceKeys = getRole(roles, "content_manager")
    }
    
    private static getRole(Map jwtPayload, String key){
        def val = jwtPayload?.get(key)
        if(val != null && val instanceof List<String>)
            return val
        return []
    }
    
    boolean isContentManager(String type){
        return contentManagerTypes.contains(type)
    }
}
```

```groovy
// .../yourpackage/CustomMethodSecurityExpressionRoot.groovy
class CustomMethodSecurityExpressionRoot extends SecurityExpressionRoot implements MethodSecurityExpressionOperations {

    Object filterObject
    Object returnObject

    CustomMethodSecurityExpressionRoot(Authentication authentication) {
        super(authentication)
    }

    private JWTPayload getJwtPayload(){
        Authentication auth = getAuthentication()
        JwtTransformer.toJWTPayload(auth?.credentials?.toString() ?: '')
    }

    // Should be used inside annotation
    boolean isArticleContentManager() {
        jwtPayload?.isContentManager('articles')
    }

    @Override
    Object getThis() {
        return this
    }
}
```

Now I can just define this newly built security expression inside authorization annotation.

```groovy
@Service
class ArticleService {

    @Autowired
    private ArticleRepository articleRepository

    @PreAuthorize("isArticleContentManager()")
    @Transactional
    Article save(Article item) {
        articleRepository.saveAndFlush(item)
    }

    ...
}
```

## Tests

Annotation expression had to be tested and for this it was necessary to have security context and be able to bypass Auth0 token validation.

```groovy
@RunWith(SpringRunner.class)
@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class IndexControllerIntegrationTests {

    @Autowired
    private MockMvc mvc

    @Test
    void "authentication required"(){
        mvc.perform(get("/api/whoami")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
    }

    // does not work, yet!
    @Test
    void "authenticated user allowed to access"(){
        mvc.perform(get("/api/whoami")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
    }

}
```

### Security context in tests

Integration tests required a user to be set in security context but [`@WithMockUser`](https://docs.spring.io/spring-security/site/docs/5.0.2.RELEASE/reference/htmlsingle/#test-method-withmockuser) and [`@WithUserDetails`](https://docs.spring.io/spring-security/site/docs/5.0.2.RELEASE/reference/htmlsingle/#test-method-withuserdetails) annotations did not work, had to [follow documentation to create custom security annotation](https://docs.spring.io/spring-security/site/docs/5.0.2.RELEASE/reference/htmlsingle/#test-method-withsecuritycontext) for tests which itself is annotated with [`@WithSecurityContext`](https://docs.spring.io/spring-security/site/docs/5.0.2.RELEASE/reference/htmlsingle/#test-method-withsecuritycontext) , for this reason 3 new files appeared:

* `WithMockToken` — custom annotation, allowing to configure user details;
* `WithMockTokenSecurityContextFactory` — created security context based on details in new annotation;
* `MockAuthenticationJsonWebToken` — `Authentication` similar to the one used by _Auth0_ when validating token [`AuthenticationJsonWebToken`](https://github.com/auth0/auth0-spring-security-api/blob/1.0.0/lib/src/main/java/com/auth0/spring/security/api/authentication/AuthenticationJsonWebToken.java) but without verification. Did not extend it to avoid construction of `JWTVerifier`.

```java
// .../yourpackage/WithMockToken.java
@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = WithMockTokenSecurityContextFactory.class)
public @interface WithMockToken {
    String[] types() default "articles";
    boolean isAuthenticated() default true;
}
```

```java
// .../yourpackage/WithMockTokenSecurityContextFactory.java
public class WithMockTokenSecurityContextFactory implements WithSecurityContextFactory<WithMockToken> {

    @Override
    public SecurityContext createSecurityContext(WithMockToken tokenAnnotation) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();

        Map<String, Object> claims = new HashMap<>();
        claims.put("GivenName", "Johnny");
        claims.put("Surname", "Rocket");
        claims.put("Email", "test@user.com");
        Map<String, String[]> roles = new HashMap<>();
        roles.put("content_manager", tokenAnnotation.types());
        claims.put(JWTPayload.ROLES_KEY, roles);

        String token = Jwts.builder()
                .setIssuer("foobar")
                .setAudience("barfoo")
                .addClaims(claims)
                .signWith(SignatureAlgorithm.HS256, Base64.encodeBase64("123456".getBytes()))
                .compact();

        Authentication auth = new MockAuthenticationJsonWebToken(token, tokenAnnotation.isAuthenticated());
        context.setAuthentication(auth);
        return context;
    }
}
```

Above in ***WithMockToken.java*** `types()` method will allow to set custom access types for user in the annotation, similar approach can also be taken to define different roles.

***WithMockTokenSecurityContextFactory.java*** gets annotation instance to create security context; inside new authentication is set using the token which is built on the fly with `io.jsonwebtoken.Jwts` builder.

```java
// .../yourpackage/MockAuthenticationJsonWebToken.java
public class MockAuthenticationJsonWebToken implements Authentication, JwtAuthentication {

    private DecodedJWT decoded;
    private boolean authenticated;

    public MockAuthenticationJsonWebToken(String token, boolean isAuthenticated) {
        this.decoded = JWT.decode(token);
        this.authenticated = isAuthenticated;
    }

    @Override
    public String getToken() { return decoded.getToken(); }

    @Override
    public String getKeyId() { return decoded.getKeyId(); }

    @Override
    public Authentication verify(JWTVerifier verifier) throws JWTVerificationException {
        this.authenticated = true;
        return this;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String scope = decoded.getClaim("scope").asString();
        if (scope == null || scope.trim().isEmpty()) {
            return new ArrayList<>();
        }
        final String[] scopes = scope.split(" ");
        List<SimpleGrantedAuthority> authorities = new ArrayList<>(scopes.length);
        for (String value : scopes) {
            authorities.add(new SimpleGrantedAuthority(value));
        }
        return authorities;
    }

    @Override
    public Object getCredentials() { return decoded.getToken(); }

    @Override
    public Object getDetails() { return decoded; }

    @Override
    public Object getPrincipal() { return decoded.getSubject(); }

    @Override
    public boolean isAuthenticated() { return authenticated; }

    @Override
    public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {
        this.authenticated = isAuthenticated;
    }

    @Override
    public String getName() { return decoded.getSubject(); }
}
```

### Using test annotation

Extending previously failing test method with annotation we get desired result.

```groovy
// <...>
class IndexControllerIntegrationTests {

    // <...>

    @Test
    @WithMockToken
    void "authenticated user allowed to access"(){
        mvc.perform(get("/api/whoami")
            .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
    }
}
```
