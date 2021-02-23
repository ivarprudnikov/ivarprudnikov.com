---
layout: post
title: Jumping from React Native to SwiftUI
image: /assets/neonbrand-TtlSPDneJgM-unsplash.jpg
image_caption: Photo by NeONBRAND on Unsplash
---

Just briefly after Christmas, a new idea got into my small head. To build a new but straightforward app for my own use. Nothing fancy, just a questionnaire app.

Due to the habit of using React in web development, I took it for granted and picked up
React Native (RN). The choice seemed obvious. It also sounded similar to the likes of Sencha and Cordova that were used ages ago. The only difference was that now all felt much more integrated.

Time passed, prototyping experience seemed OK. The first issue to me was the build tool
RN uses, called Metro. Why would it not be Webpack, I thought (sure, there were probably reasons).
The first issue of Metro is the name; it felt like something from Microsoft. Then there was
documentation, it is not very complete, I'd say, more examples would be terribly helpful.
Otherwise, it was great (honest recognition of its positives).

Another negative point to me was the way everything was glued. I'm not well versed in iOS
but the Android folder dropped a shadow on me. It is painful to maintain the Android app alone but to do that when wrapped with the RN was another challenge. Maybe I'm just exaggerating, and there are no long term issues (_promises_).

Finally, I wanted to publish my tiny app somehow. This is where Apple Gods began throwing turds at me. I was forced against my will to use Xcode and do something to finish preparations for publishing. It was like I was in another world that did not respect people using terminals. Long story short, it was so painful for me to understand how RN
interfaces with Xcode that I started the whole thing from scratch. On Xcode, using Swift.

So much excitement is discharged when a half-baked geek starts programming in a new language.
SwiftUI is excellent, quite similar to React in the way that it renders views. Little I understood in those moments of joy. Apparently, SwiftUI is not a finished "product". There are multiple examples online where people agree on this (Reddit, StackOverflow). It is like an unfinished
DSL that you must use in an unresponsive IDE (Xcode). Why did I use SwiftUI, you ask. It was a default option in Xcode, and like any sensible human being, I did not change it.

To summarise, I lost the will to program. Will cry on my pillow, will hug my iDevices. Expect 
WWDC will bring updates to SwiftUI to make my life easier.

React Native app - [github.com/ivarprudnikov/self-analysis-app](https://github.com/ivarprudnikov/self-analysis-app)

SwiftUI app - [github.com/ivarprudnikov/self-analysis-ios](https://github.com/ivarprudnikov/self-analysis-ios)
