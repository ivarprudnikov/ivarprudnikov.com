---
layout: post
title: "Android DI with Dagger2 plus sample app"
image: /assets/appcomponent-java-preview-in-ide.png
image_caption: "AppComponent.java preview"
---

Here we are, app is already in production, codebase is growing bit by bit.

This is a simple app we have — narrow use case, multiple flavours, customers extend it slowly by requesting sensible features reflecting their business needs. Build pipeline is automated, every commit triggers a build on Travis which in turn produces **.apk* files that land in location used by anyone testing. App internals are not that complicated either — 10–20 conditionals checking if current customer is *X* or *Y* that switch one feature or disable another, additional text changes are managed in resource files which is natural in Android.

Everything is great until there is another customer, and another, and so on. Now all those prior conditionals, checking to see if a feature gets enabled or disabled, grow faster and it gets hard to understand effects of one change or another. But it is now possible to detect that every customer must implement defined set of feature extensions (i.e. *Theme configuration*), those could be configured somewhere and then added to activities; I could just use bunch of factories but *DI* feels like a better fit and should be a solved problem these days, or should it? Android does not have support for it natively :/

Here I’ll show couple of steps I took to add [Dagger2](https://google.github.io/dagger/) as dependency injection (DI) framework to an Android app. Why Dagger? it is/was recommended (not sure when you read this) in the official [docs](https://developer.android.com/topic/libraries/architecture/guide.html):

> Dependency injection (DI): Dependency injection allows classes to define their dependencies without constructing them. At runtime, another class is responsible for providing these dependencies. We recommend the Dagger 2 library for implementing dependency injection in Android apps. Dagger 2 automatically constructs objects by walking the dependency tree, and it provides compile-time guarantees on dependencies.


Well, first what you will discover is that [Dagger documentation for Android](https://google.github.io/dagger/android.html) is not a *1 hour* read as you need to jump from place to place to stitch everything in your mind together; imagine referring your junior developers there. Another difficulty is the amount of blog posts about its use/integration, I found they’re a bit confusing as they are divergent, with varying app structures, several setup instructions (not all using available helper classes); it complicates whole on-boarding process. Furthermore I need to mention the amount of configuration, which is necessary but initially looks excessive, it will be evident here where app is very small.

## Before Dagger2

I’d love to remind my future self how I used DI in Android and for this very purpose I’ve set up a small app which is going to integrate with Dagger. I did 3 parts: main screen with greeting, theme preview and settings where user can amend greeting and theme.

<div class="d-flex justify-content-center align-items-start mb-4">
  <figure class="flex-fill text-center figure">
    <img class="img-fluid" alt="app file structure" src="/assets/app-file-structure-before-dagger2.png" />
    <figcaption class="figure-caption">
      <a href="https://github.com/ivarprudnikov/android-add-dagger/tree/v1">App structure before Dagger</a>
    </figcaption>
  </figure>
</div>

Amount of code is trivial here. There is *MainActivity.java* which shows a greeting and a button that leads to customisable view backed by *ThemeActivity.java*. Theme lets user preview whatever was selected in settings screen. You can check out this version of [code in GitHub](https://github.com/ivarprudnikov/android-add-dagger/tree/v1). You might notice usage of _Butterknife_ in code, I’ve added it to reduce noise of boilerplate required to set up views.

<div class="d-flex justify-content-center align-items-start mb-4">
  <figure class="flex-fill text-center figure">
    <img class="img-fluid" alt="change welcome message" src="/assets/android-app-before-dagger2-change-settings.gif" />
    <figcaption class="figure-caption">Changing welcome message</figcaption>
  </figure>
  <figure class="flex-fill text-center figure">
    <img class="img-fluid" alt="change theme" src="/assets/android-app-before-dagger2-change-theme.gif" />
    <figcaption class="figure-caption">Setting Red theme</figcaption>
  </figure>
</div>

### What could be refactored?

Below is a code excerpt from _MainActivity_ and here I load _SharedPreferences_ on each resume , I suggest this is a good candidate to be injected as preferences could easily be reused in other future/existing activities.

```java
public class MainActivity extends AppCompatActivity {

  //<...>
  
  @BindView(R.id.home_content)
  TextView homeContent;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
   super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
    ButterKnife.bind(this);
    setSupportActionBar(toolbar);
  }

  @Override
  protected void onResume() {
    super.onResume();
    SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(this);
    String welcomeKey = getString(R.string.pref_home_welcome_key);
    String welcomeDefault = getString(R.string.pref_home_welcome_default);
    homeContent.setText(sharedPref.getString(welcomeKey, welcomeDefault));
  }

  //<...>
}
```

Another example of what could be refactored is in _ThemeActivity_ Following previous example we could make _SharedPreferences_ injectable, but also the _Theme_ itself could be instantiated and made available to activity by DI.

```java
public class ThemeActivity extends AppCompatActivity {

  @BindView(R.id.customer_content)
  TextView customerContent;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_customer);
    ButterKnife.bind(this);
  }

  @Override
  protected void onResume() {
    super.onResume();
    SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(this);
    String themeLabel = sharedPref.getString(getString(R.string.pref_customer_theme_key), Theme.DEFAULT.getLabel());
    Theme theme = Theme.fromLabel(themeLabel);
    customerContent.setText(getString(R.string.activity_theme_text, theme.getLabel()));
    customerContent.setBackgroundColor(theme.getBackgroundHex());
    customerContent.setTextColor(theme.getForegroundHex());
  }

  //<...>
}
```

## After adding Dagger2

Because I’ve had existing application and code was structured already I did create new package and called it di You might have seen it being used in other Dagger examples already.

Current setup is not finished yet, as there is an issue with theme selection — it does not change immediately after getting back from settings, but I’ll tackle it later. For now there are **7 new files**!

<div class="d-flex justify-content-center align-items-center mb-4">
  <figure class="flex-fill text-center figure">
    <img class="img-fluid" alt="updated app file structure" src="/assets/app_file_structure_after_dagger2.png" />
    <figcaption class="figure-caption">
      <a href="https://github.com/ivarprudnikov/android-add-dagger/tree/v2">App structure after Dagger</a>
    </figcaption>
  </figure>
  <figure class="flex-fill text-center figure">
    <img class="img-fluid" alt="code changes" src="/assets/app_codebase_dagger2_codebase_changes.gif" />
    <figcaption class="figure-caption">Code changes</figcaption>
  </figure>
</div>

Firstly it was necessary to subclass _Application_ and Dagger helps with it by providing _DaggerApplication_ which hides some boilerplate code you’d need to do in order to initialise DI:

```java
public class App extends DaggerApplication {
  @Override
  public void onCreate() {
    super.onCreate();
  }
  @Override
  protected AndroidInjector<? extends DaggerApplication> applicationInjector() {
    return DaggerAppComponent.builder()
                .application(this)
                .build();
  }
}
```

Then there are *configuration classes*:

* *AppComponent* — I like to think of it as a root node of our dependency graph, it dies along with all its children nodes. It would also be possible to have multiple components with varying *lifecycle* (*scope*), here it is marked as Singleton and is instantiated in theApp

* *Module* — configuration of your injectables, there is more that one because there are some rules that do not mix together, i.e. Binds and Provides annotated methods.

* *ActivityScoped* — custom lifecycle annotation.

### How did refactoring go?

As mentioned above I’ve refactored _MainActivity_ and _ThemeActivity_ which now contain injected _SharedPreferences_ and _Theme_

```java
public class MainActivity extends AppCompatActivity {

  //<...>

  @Inject
  SharedPreferences sharedPreferences;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    AndroidInjection.inject(this);
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
    ButterKnife.bind(this);
    setSupportActionBar(toolbar);
  }

  @Override
  protected void onResume() {
    super.onResume();
    String welcomeKey = getString(R.string.pref_home_welcome_key);
    String welcomeDefault = getString(R.string.pref_home_welcome_default);
    homeContent.setText(sharedPreferences.getString(welcomeKey, welcomeDefault));
  }

  // <...>
  
}
```

For above to work I had to configure _SharedPreferences_ in one of the modules used by our main component.

```java
@Module
public class SharedModule {
  @Provides
  SharedPreferences provideSharedPreferences(Context ctx) {
    return PreferenceManager.getDefaultSharedPreferences(ctx);
  }
}
```

The new module _SharedModule_ which contained _Provides_ annotated method returned instance of preferences but it required _Context_ to work. This context was available as we have access to application object:

```java
@Module
public abstract class AppModule {
  @Binds
  abstract Context bindContext(Application application);
}
```

Above module configurations could not be mixed because of the _Provides_ and _Binds_ annotation usage. And both of them were set up in the main component:

```java
@Singleton
@Component(modules = {AppModule.class, SharedModule.class, ActivityBindingModule.class, AndroidSupportInjectionModule.class})
public interface AppComponent extends AndroidInjector<App> {
  @Component.Builder
  interface Builder {
    @BindsInstance
    AppComponent.Builder application(Application application);
    AppComponent build();
  }
}
```

Theme activity refactoring had to follow a different path.

```java
public class ThemeActivity extends AppCompatActivity {
  //<...>

  @Inject
  Theme theme;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    AndroidInjection.inject(this);
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_customer);
    ButterKnife.bind(this);
  }

  @Override
  protected void onResume() {
    super.onResume();
    customerContent.setText(getString(R.string.activity_theme_text, theme.getLabel()));
customerContent.setBackgroundColor(theme.getBackgroundHex());
    customerContent.setTextColor(theme.getForegroundHex());
  }
  //<...>
}
```

Theme injection config was similar to the _SharedPreferences_ but it needed to be tied to its own lifecycle for it not to become stale, this was supposed to be managed by new _ActivityScoped_ annotation:

```java
public class ThemeModule {
  @Provides
  @ActivityScoped
  Theme provideTheme(Context context, SharedPreferences sharedPreferences) {
    String selectedTheme = context.getString(R.string.pref_customer_theme_key);
    String defaultTheme = Theme.DEFAULT.getLabel();
    String themeLabel = sharedPreferences.getString(selectedTheme, defaultTheme);
    return Theme.fromLabel(themeLabel);
  }
}

//<...>

@Documented
@Scope
@Retention(RetentionPolicy.RUNTIME)
public @interface ActivityScoped {}
```

### Configuring module to be used in Activity

Because activities are managed by Android there is only one place to hook into their lifecycle, i.e. via provided methods like _onCreate_ For this reason we have to send signal to DI and tell it when activity is ready to get injectables:

```java
protected void onCreate(Bundle savedInstanceState) {
    AndroidInjection.inject(this);
}
```

Above piece of code will get our _App_ object which extended _DaggerApplication_ and will try to add this _Activity_ to the graph, and it will fail as Android constructed instances need an additional factory set up for each (for _MainActivity_ and _ThemeActivity_). Fortunately Dagger gives as an ability to do it without too much code:

```java
@Module
public abstract class ActivityBindingModule {

  @ActivityScoped
  @ContributesAndroidInjector
  abstract MainActivity mainActivity();

  @ActivityScoped
  @ContributesAndroidInjector(modules = ThemeModule.class)
  abstract ThemeActivity themeActivity();

}
```

Above module was added to main component as well. It will generate code which will contain necessary factories for each of the methods.

You can also see the _ThemeModule_ configuration in _ContributesAndroidInjector_ annotation used for _ThemeActivity_

## Summary

Usage of Dagger in small applications does not make sense although I’ve introduced same pattern in the app with at least 15 activities and bunch of flavours and it made code easier to understand.

In contrary, configuration is quite hard to understand, but recently introduced helpers _DaggerApplication_ , _ContributesAndroidInjector_ , _AndroidInjection_ mitigate visible complexity and boilerplate.

I haven’t touched on Scopes here yet, despite the necessity to fix small theme appearance issue in _ThemeActivity_ after refactoring, but there are some further reading links about it below.

### Versions numbers

Dagger 2 was added to the Android application with following versions:

```groovy
android {
  //<...>
  compileSdkVersion 26
  buildToolsVersion "26.0.2"
  defaultConfig {
    minSdkVersion 21
    targetSdkVersion 26
    //<...>
  }
  //<...>
  dependencies {
    //<...>
    def dagger_version = "2.14.1"
    implementation "com.google.dagger:dagger-android:$dagger_version"
    implementation "com.google.dagger:dagger-android- support:$dagger_version"
    annotationProcessor "com.google.dagger:dagger-android-processor:$dagger_version"
    annotationProcessor "com.google.dagger:dagger-compiler:$dagger_version"
    provided 'javax.annotation:jsr250-api:1.0'
  }
}
```

### Useful resources

- [**Tasting Dagger 2 on Android**
 fernandocejas.com](https://fernandocejas.com/2015/04/11/tasting-dagger-2-on-android/)
- [**DAGGER 2 - A New Type of dependency injection**
youtube video](https://www.youtube.com/watch?v=oK_XtfXPkqw)
- [**Dagger ‡ A fast dependency injector for Android and Java.**
A fast dependency injector for Android and Java](https://google.github.io/dagger/android.html)
- [**Dagger 2 : Component Relationships & Custom Scopes**
 proandroiddev.com](https://proandroiddev.com/dagger-2-component-relationships-custom-scopes-8d7e05e70a37)
- [**Building UserScope with Dagger2 - froger_mcs dev blog**
frogermcs.github.io](http://frogermcs.github.io/building-userscope-with-dagger2/)
- [**Dagger 2. Part II. Custom scopes, Component dependencies, Subcomponents**
Dagger 2 articles cycle proandroiddev.com](https://proandroiddev.com/dagger-2-part-ii-custom-scopes-component-dependencies-subcomponents-697c1fa1cfc)

### App samples

- [**ivarprudnikov/android-add-dagger**](https://github.com/ivarprudnikov/android-add-dagger)
- [**android10/Android-CleanArchitecture**](https://github.com/android10/Android-CleanArchitecture)
- [**gk5885/dagger-android-sample**](https://github.com/gk5885/dagger-android-sample)
- [**mgrzechocinski/dagger2-example**](https://github.com/mgrzechocinski/dagger2-example)
- [**JakeWharton/u2020**](https://github.com/JakeWharton/u2020)
- [**yongjhih/dagger2-sample**](https://github.com/yongjhih/dagger2-sample)
- [**bytehala/dagger2-gradle-quickstart**](https://github.com/bytehala/dagger2-gradle-quickstart)
