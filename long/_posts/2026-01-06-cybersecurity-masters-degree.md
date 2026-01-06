---
layout: post
title: Masters in Cybersecurity
image: /assets/graduation-ceremony.jpg
image_caption: "Graduation moment on stage"
toc: true
---

I would love to cover various details of going through the Masters degree in Cybersecurity in a local college, since it is still fresh in my mind.

It might be sensible to talk about why I chose this particular degree and college first. I'll then elaborate on the dynamics of the course delivery and communication with peers. Then, I'll focus on the different modules. Another section will be about the final thesis and how AI tooling is affecting students. Lastly, I'll talk about the overall impression, the value of going through it, and how it compares to the industry to the best of my knowledge.

## Why, where and how much?

There were a few drivers that hinted me to enroll in the course. Firstly, it was about expanding my knowledge and filling in the blanks, then it was about having an official credential which is sometimes required when applying for specific jobs or, say, a work visa if I wanted to. I did try various other online courses before, like Udacity, as well, but I found out about the funding program which lets you apply to various courses that are publicly funded here in Ireland. It is called Springboard. There is a set of available courses that can be remote or in-person, covering a variety of subjects and levels. I was looking to see if there was anything remote and came across National College of Ireland having a few of them. If I recall correctly there were AI- and cloud computing-focused courses as well, but they were full. Given that I do work and develop secure software already, cybersecurity felt like a good match. I was afraid the choice would not be that useful at work, given that security related forums would usually suggest going through SANS or OSCP or similar certifications instead, or just focus on practicing using platforms like TryHackMe. In addition to that, I believe that having OSCP certification on the CV has more impact when applying to security focused positions as well - it would demonstrate practical knowledge of offensive security, i.e. the actual ability to compromise a machine in a controlled environment. But as I lacked any proper credentials, and the course was cheapish (and remote), I thought to give it a go and see it for myself. I did not particularly care about the college name or status, but rather if the credential was valid, i.e. would I be able to use it when applying to some other university.

Just to put things in perspective, it is important to cover the bits of the enrolment process and mention how much it cost me. To begin with it was the postgrad diploma that I registered for. I used industry experience as part of the application process and a cover letter to explain why I wanted to enroll. This was mainly because I am a mature student and any credential that is more than 10 years old would not be counted. The course cost around €7000 but the government funded 90% of it and I had to pay the difference. It is later, after a year when I did the postgrad diploma, that I had the chance to upgrade to Masters, which required me to pay an additional €2900 and that part was not funded. There was also a requirement to have good grades to be able to proceed with this upgrade. In total I spent around €3600 and a lot of time over the period of roughly 18 months to be able to call my mom and share the news.

## Course delivery

College was relying on Moodle as a system to deliver course information to the students, you would have access to those and the lecturers would upload the material for the students to read through (slides, templates, assignments). Literature would be listed in the subject information page which would be separate from Moodle. We had access to the library which in turn had all the digital resources and publications. Lectures were delivered via meetings in Teams, everyone would have a Microsoft based account which would let you use Teams, Word, PowerPoint etc. There were also virtualized environments if students had issues with their own machines, i.e. connect to your own VM instance and do the work there instead. Lecturers would usually have slides and would talk over them, expanding on some specific points, or would demo the specific tooling when necessary, e.g. usage of nmap, Metasploitable, machine learning notebooks. The lectures were recorded which was actually a requirement of the initial course provider Springboard, otherwise they would be reluctant, like we observed after upgrading to Masters. Recordings were invaluable as the lectures were being delivered in the evening and some of us would need to work later than expected. Another important part was assignments which were necessary to upload through Moodle system where the upload page would expire at a specific time. Finally there were evaluations at the end of the subject and those would either be a separate project, a live online exam or a timed assignment. In the case of a live exam you would get into a call with a lecturer, they would unlock the file with questions and the student would have some 3 hours to answer them and upload their answers. There was also a timed assignment which was similar to the exam but the student had more time to submit. Plagiarism, AI generated content was inspected by Turnitin, which would show the suspicious lines with a specific classification and a reference to the original, e.g. if you copy paste some paragraph from a book it would identify it as such and would provide a book reference. Such a system encouraged personalized note taking to be able to use those at the time of the exam.

Once our classes started online, someone created a WhatsApp group (sorry I just do not remember who, but thank you!) for us all to join and have a location where to share general questions and coordinate. This group was invaluable as you would always be on top of everything.

### Modules and assignments

The initial postgrad diploma course was split into 3 semesters over 9 months [1] and there were 3-4 subjects per semester [2]:

- Semester 1 (started in January)
  - Security Fundamentals 
  - Data Governance, Ethics, and Sustainability 
  - Secure Web Development (Elective) 
- Semester 2 
  - Network Security and Penetration Testing
  - Cryptography and Blockchain
  - Malware Analysis (Elective)
- Semester 3
  - Cloud Architectures and Security
  - AI/ML in Cybersecurity
  - Business Resilience and Incident Management

There was also a career bridge but I chose to be exempt due to the satisfactory employment position. Otherwise, college would reach out regularly and would suggest students to come out and engage in prospective job placements.

It was quite intense and the tight deadlines would require to not just be present in the lectures but also manage your remaining time well (many of us were employed already) and complete the assignments in time. If there were 3 subjects per 3 months and they would always have some project in the middle and then an evaluation at the end, it leaves you with little time to prepare. I believe you could just try and wing it and the college would not be too harsh but then the whole point of taking part in the course makes little sense. I had a good footing due to my industry experience and took it as an opportunity to see how many gaps I have in understanding each of the subjects.

The first semester was a great stepping stone in my case, I ended up writing a small "secure" app [3] for Secure Web Development as an assignment, which implements various improvement techniques. Controversially, data governance was one of those interesting subjects to me, it was fairly dry but the lecturer tried to explain the various aspects of the subject, there was a lot that I did not have a chance to experience at work so it was difficult to ingest it as well. Data governance is a documented field with good books to read and research (if you find yourself in the position that requires to implement it). There were great topics covering privacy, GDPR, legislation, corporate policies. Security Fundamentals subject necessitated to do an assignment which required to research recent cybersecurity incidents and do an analysis on them.

Then in the second semester we had one lecturer deliver two subjects - malware analysis and pentesting. There was a lot of hands on where we had to setup our VMs to be able to securely analyse malware or to carry out the pentesting. Malware analysis was evaluated based on 2 assignments where one focused on building the lab environment and evaluating malware taken from the "Zoo" (a malware sample repository), without using the lab though, just online tooling like VirusTotal or any.run. Second assignment required writing a report about some known malware and all the details about it, e.g. QBot/Qackbot. Pentesting was about the various tools you can use to do reconnaissance and evaluation of the system, in one assignment we did use recent hackthebox challenges and wrote a report about the process to try and take it down, second assignment required to make a small company network challenge inclusive of devices and then evaluate and mitigate potential vulnerabilities. Third subject "crypto and blockchain" was academic in nature, it covered foundational cryptography, DHKE, RSA where we had to learn how to encrypt/decrypt by hand (which was part of the evaluation as well), but there was also some blockchain usage where students had to use metamask, send/receive crypto and write a small solidity contract. Crypto and blockchain had two assessments in the form of a timed online knowledge evaluation.

Final semester was a challenge due to some signs of exhaustion. Some of the students dropped off by that time. Despite the mood we all felt the end was nigh. Cloud architectures and security subject covered many aspects about the systems in the cloud and HPC. There was some project work where we had to deploy a standalone Wordpress installation in AWS and then secure it, e.g. add captcha, filter traffic, add TLS, enable disk encryption and install monitoring agents along with alerts and dashboards. The subject ended in a timed exam. Second subject was about incident management and resilience. This was more about how to structure teams in an organisation to manage incidents, how to plan incident response and why would you need SOC or red/blue teams. It was evaluated using two separate timed assessments. Lastly it was AI/ML which was quite academic in nature, there was a lot of information about how to train the systems, how to use well-known approaches such as random forest. The lecturer employed a large virtual board to try and bridge various concepts and then follow it up with the example implementation in a Jupyter notebook. A single project was the focus of the evaluation which began by each of us proposing some idea to do first and then follow it up with the implementation and the presentation. We had to come up with some idea backed up by recent research papers, then find a dataset and do some training. It was quite challenging primarily because we could not use some well known approaches like the ones you can find the solutions for in Kaggle, and tight timeframes made it slightly difficult to find the dataset to work on. I found some niche dataset which had a linked research paper and tried to reproduce the findings, this was about detecting attacks against vehicles [4].

The journey through these modules was slightly intense and interesting, there were gaps in my knowledge that were filled to the brim.

For clarity: all offensive security, pentesting, and malware work mentioned here was done as part of coursework in isolated lab/CTF-style environments, with explicit authorization and without targeting any real systems.

## Thesis

We have been asked if we were interested in continuing our post-grad diploma into Masters, to which a bunch of us agreed. The prerequisite was that all of our assignments are complete and without issues.

We had a few subjects which were explaining the research aspects and how to approach it. How to formulate the research question and how to find suitable peer reviewed work. Also, how to deal with the datasets. It was all very useful as lecturers spelled out various requirements of the deliverable.

There were two subjects which were effectively talking about similar things but the emphasis was to make sure that everyone is on track and can propose ideas for their research or project work. Once we got past those we got split up into smaller groups and the supervisor was assigned. You would meet them every two weeks and talk about the research project and the supervisor was encouraging to move forward and not be behind. However, the supervisors did not have much time to spare for us which made it slightly difficult at times to move forward.

I have struggled with the research idea quite a bit. Due to all this industry push towards AI I felt like I need to do something about it and leverage it to gain more expertise in and around the field. Unfortunately this resulted in a very narrow and ill defined question which was not really corrected at any point in conversations with the supervisor. I tried to find some LLM usage issues when it was used in a specific detection scenario.

The journey through the research was valuable though. I got exposed to multiple interesting papers and projects related to prompt injections and the evaluations of AI systems. But the data I gathered was not enough and I believe not really worth much [5]. I am not too embarrassed by it as it gave me some good insights but if I did it again I would approach this differently.

## Overall value

A bit more than eighteen months of somewhat intense studying was a great experience. I am glad it is over and would consider doing something similar again in a couple of years. I was not cheating and tried doing it for myself so it was valuable form that perspective. In terms of expenses it was also worth it, not many will oppose to me saying that €3600 was not a lot of money to pay, if that was €10k or more I would think much harder before the enrolment.

If speaking from the professional side I would say this covers only part of what would be necessary to be a great security engineer or analyst or pentester. I suppose it covers the basics for the people to grasp the cybersecurity subject better and prepare them for a real world job. Would I hire someone who presented to me with the same degree in the same college? I think yes but I would not trust it blindly. I think security is not a career but rather a life choice, one diploma just does not cut it, there are so many things happening which requires you to be in the field and constantly learning. I cannot say that SANS, OSCP or CompTIA would be better as I did not do those.

Why would I be slightly critical? I think the impression I had was that it should be fairly easy to fly through the assignments by overusing AI tools. Yes, there are checks in place (Turnitin) and the lecturers were very clear in reminding us that the use of AI is not allowed or tolerated. Like anywhere else, I am sure some people will try to cut corners, but that is not the point of doing the course, and I treated it as a learning exercise.

Another question is how much of what I learned is actually useful in a security related job. I am working with confidential compute which was not even mentioned in the curriculum. However, having hands-on examples creating malware or doing reverse engineering is useful, going through network analysis was very useful, analysis of various papers and articles gives a better understanding of various vulnerabilities, monitoring, attack vectors. Compliance related lectures were great because you rarely read such stuff having a cup of coffee, it was sort of forced on you for a good reason. All those papers, books and posts have refreshed the knowledge so you feel like having a sharper vision. And the most relatable would be the need to write docs and specs which is much easier now. I think another great value is that it qualifies me for the various positions where Masters is a requirement these days.

An alternative could be to find another job in the field. But if you were not that kid who used tools under Backtrack/Kali or reverse engineered for fun, then you might need to fill some gaps anyway.

## References

- [1] [NCI PGDip course summary](https://www.ncirl.ie/Courses/NCI-Course-Details/course/PGDCYBE)
- [2] [NCI PGDip course subjects](https://nci.akarisoftware.com/index.cfm/page/course/courseId/9049)
- [3] [GitHub - Secret message share](https://github.com/ivarprudnikov/secret-message-share)
- [4] [Kaggle - ML vehicle attack detection](https://www.kaggle.com/code/ivarprudnikov/veremi-simulated-vehicle-attack-detection)
- [5] [GitHub - Evaluations of prompt injection detections using LLMs](https://github.com/ivarprudnikov/llm-prompt-injection-detection-accuracy)




