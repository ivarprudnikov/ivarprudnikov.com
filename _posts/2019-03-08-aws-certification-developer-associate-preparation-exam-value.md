---
layout: post
title: "AWS certification: preparation, exam and value"
image: /assets/aws-certified-article.jpg
toc: true
---

March 2019. Just passed my first Amazon Web Services (_AWS_) certification exam - _AWS Certified Developer - Associate (DVA)_ and wanted 
to share my preparation experience and what I found useful/stupid in the process.

## Motivation

Certification or even degrees are not really necessary in software, there are no regulatory requirements as far as I know. 
In all of my relatively short career working as a software engineer I had never been asked for any sort of certificate or proof
of course completion or licence. What is more I do develop applications to be used in public sector which would seem as a ground
where one expects to provide some proof, but public organisations are not asking for such proofs and to my mind would 
fail to even understand what should be required anyway. All this is contrary to _e.g._ requirements for civil engineers who 
must have a degree, experience and in most cases hold a licence.

When regulation is absent and no consensus exists in the industry employers are left guessing who is a _normal_ developer
and/or valuable investment in the company. To my mind this is why we see more companies giving hard time for potential 
employees going through rigid recruitment process requiring to do lengthy software development tests. Do not even get me 
started on this, tests take time, usually are not paid for, and often require developer to do them when they actually need 
to be at work. The process is clearly not scalable when one searches for a job among multiple companies.

Lately we - developers - saw a massive shift to the cloud where couple of main players dominate the market. This in 
turn reduces the scope of what developer needs to interact with, think when companies use only _Azure_ or only _AWS_ services.
Then from employers perspective there is this one very important thing developer needs to know among all that fuzzy stuff 
which you can hardly measure anyway. But in this case the same providers _Azure_/_AWS_ provide their own certification which 
should signal with an authority to employer, it should tell something along the lines: _"This person knows which buttons
to press in my mega complicated console"_. The last point is crucial here although it sounds a bit sarcastic.   

At work I regularly use _AWS_ but here I was again looking into _AWS_ console and not even knowing what half of those services 
they have are supposed to do. What are best practices of gluing them. 
So yeah, [aws.training](https://www.aws.training/) it is.

## Preparation

There is much and more of documentation in _AWS_, more than one wishes to read in a lifetime. This poses a problem, what do 
you need to read, is there a priority? What am I supposed to know about _AWS_ to pass certification?

There is this [list of suggestions in _AWS_](https://aws.amazon.com/certification/certified-developer-associate/) and in 
my case it contained list of _whitepapers_ to read and a suggestion to 
have an _AWS_ course which is not cheap and one has to attend classes. I was expecting some sort of online course you can 
take like in _Coursera_ or _Udemy_. I swallowed suggestions and began reading papers though.

My list contained 10+ whitepapers which did not seem a lot before I knew how long they were. For example _AWS Well-Architected 
Framework_ is 86 pages long, you get the idea. Papers contained high level stuff and suggestions which services to use 
for various use cases. But I have to say I found it really useful, especially _AWS Security Best Practices_ which contains 
examples on how would one approach security review/audit. Right, so I read recommendations, it was very informative but 
have to disappoint you - there is little correlation between questions asked in exam and these papers. This is a bit 
problematic as now I know whoever passed the same exam might not even bothered reading those papers in the first place.

> There is little correlation between questions asked in exam and suggested _AWS_ whitepapers

Now after reading all the papers I went fishing for online course to further prepare and found this crowd [_A Cloud Guru_](https://acloud.guru/) through those annoying pricing offers in 
[_Udemy_ where they sell a course for $15 although claim its real price is $150](https://www.udemy.com/aws-certified-developer-associate/). 
It was something around 18 hours of video and they expect you to go to _AWS_ and do those _labs_ the same way you see them
in videos, which essentially is _AWS_ services in practice, like how to create tables in _DynamoDB_ or how to host a website 
in _S3_.

> I am not affiliated with any of the companies mentioned here. I swear. It is not sarcasm.

It was the first time I tried _Udemy_, I got their app and started watching videos. The quality of content was top notch :thumbsup:, 
there were two instructors Ryan and Faye, both were professional without annoying speaking issues like 
_uhms/ahhs/ehhs/tsks_ although speaking speed is different which means you'll have to adjust speed dial when speaker changes 
(if you like speeding things up). Short quiz was at the end of each section which simulated possible questions in the exam. 
At the end of a course there was significant feeling of confidence, felt it was my best $15 investment :dollar: even if 
that would not end up helping in the exam.

Before booking my exam I spotted that _AWS_ training section offers online material as well. I did watch most of it but it
was hardly the same quality as on _Udemy_ and content was just scratching the surface of what was to be expected in exam. 
But what I learned there is that one needs to basically guess the possible answer in exam by method of elimination. 
This last bit felt so wrong as this just validates cunning and not the actual knowledge. 

So to summarise I was using parts of _AWS_ for around 5 years, I did read whitepapers and went through _A Cloud Guru_ 
course and then _AWS_ online video material.

## Exam

Before I could forget all that information from various sources exam was scheduled using [aws.training](https://www.aws.training/) 
account. They had 4 locations in 2 different cities (Cork and Dublin) available - now you are aware I'm living in Ireland. 
By the way it is not free, it was €150. 

After arriving to the specified location I found it quite busy, it is one of the places where bunch of different exams 
are being taken. There were posters on the wall describing _Microsoft_ and _CompTIA_ related certifications, also I met a guy
 who even did some _Photoshop_ exam :astonished:. You have to register with an ID first and then get taken to a room full 
 of people sitting next to computers and torturing their minds to select a proper answer shown on their screens. 
 I was led to a machine no.11 sitting in a corner between window and wall. Window was covered with vertical blinds and 
 was left open to air the place which was tightly packed with people, sitting next to window was a bit annoying as 
 one could hear chatting outside.

I went through NDA, hit _next_ and started my 130 minute session. Some questions were OK given that I spent _a bit_ of 
time preparing for exam but then there were question I was not anticipating, like _How do you specify AWS Lambda resource 
in CloudFormation template, select 2 appropriate answers_ :scream: :scream: . Now you might have used _CloudFormation_ 
 enough to remember these sort of things but in my case I touched it just once or twice. There were more similar questions 
 asking about specifics of _CodePipeline_ family services, then _Lambda_, _API Gateway_ and rest of classical ones like 
 _EC2_, _S3_, _SQS_ _etc_.

Usage of specifics in questions bothered me to the point that I was not confident enough I will pass it :sweat_smile: . 
Was there anything obvious I missed when preparing for exam? 

> Looked like there was not much one could prepare without actually using all of the services for couple of times

So yeah, I did pass the test :tada: but still waiting for some email with _results_ which will arrive in the next 5 business days.

## Professional value

Preparation process was valuable in itself as I had to read and listen to information which otherwise sounded not very 
interesting or even useful. Who reads whitepapers when you can just start writing code these days? It does not mean 
that every certificate holder did read those papers though, as I already mentioned they do not really correlate with 
exam questions that mostly focus on practical usage of _AWS_ webservices console.

Personally I am now more confident when passing recommendations on to clients. Do clients value this certification? 
This is unknown and will be so for quite a while, it is not like anyone will start praising you for badges in emails.

What is more it will definitely have an effect when I'll need to make suggestions/decisions on new candidates with 
similar certification. It proves that candidate will be able to jump into organisation and be able to deploy her code 
to our infrastructure without spending a week on reading documentation.

Should you do it? I think yes, _AWS_ is not likely going away very soon and I hear more companies use it every day. Besides this 
will incentivize to finally try out _Lambda_ or read that boring looking whitepaper.

Thanks for reading and good luck! :nerd_face:
