---
layout: post
title: Overview of getting a Masters in Cybersecurity
image: /assets/appcomponent-java-preview-in-ide.png
image_caption: "TODO"
toc: true
---

I would love to cover various details of going through a Masters degree in Cybersecurity in a local college, since it is still fresh in my mind.

It might be sensible to talk about why I chose this particular degree and college first. I'll then elaborate on the dynamics of the course delivery and communication with peers. Then, I'll focus on the different modules and what was covered in them. Another sections will be about the final thesis and how AI tooling is affecting students. Lastly, I'll talk about the overall impression, the value of going through it, and how it compares to the industry to the best of my knowledge.

## Why, where and how much?

There were a few drivers which hinted me to enroll in the courses. Firstly is the expansion of the knowledge and filling in the blanks, then it was about having an official credential which is sometimes required when applying for specific jobs or, say, a work visa if I wanted to. I did try various other online courses before like Udacity as well but I found about the funding program which lets you apply to various courses that are publicly funded here in Ireland, it is called Springboard. There is a set of available courses that can be remote or in-person, covering a variety of subjects and levels. I was looking if there was anything remote and came across National College of Ireland having a few of them. If I recall correctly there were AI and cloud computing focused courses as well but they were full. Given that I do work and develop secure software already, cybersecurity felt like a good match. I was afraid the choice will not be that useful at work, given that security related forums would usually suggest going through SANS or OCSP or similar courses instead, or just focus on practicing on tryhackme. In addition to that, I believe that having OCSP certification on the CV has more impact when applying to security focused positions as well - it would demonstrate practical knowledge of offensive security, i.e. the actual ability to pwn a machine. But as I lacked any proper credentials, and the course was cheap (and remote) I thought to give it a go and see it for myself. The beggars are not choosers, so I did not particularly care about the college name or status but rather if the credential was valid, i.e. would I be able to use it when applying to some other university. 

Just to put things in perspective, it is important to cover the bits of the enrolment process and mention how much did it cost me. To begin with it was the postgrad diploma that I registered for. I used the industry experience as part of the application process and a cover letter to explain why I wanted to enroll. This was mainly because I am a mature student and any credential that is more than 10 years old would not be counted. The course costed around 7000 but the government funded 90% of it and I had to pay the difference. It is later after a year when I did the postgrad diploma I had the chance to upgrade to Masters which required me to pay an additional 2900 and that part was not funded, there was also a requirement to have good grades to be able to proceed with this upgrade. In total I spent around 3600 and a lot of time over the period of roughly 18 months to be able to call my mom and share the news.

## Course delivery

College was relying on Moodle as a system to deliver course information to the students, you would have access to those and the lecturers would upload the material for the students to read through (slides, templates, assignments). Literature would be listed in the subject information page which would be separate. We had access to the library which in turn had all the digital resources and access to journals. Lectures were delivered via meetings in Teams, everyone would have a Microsoft based account which would let you use Teams, Word, Powerpoint etc. There were also virtualized environments if students had issues with their own machines, i.e. connect to your own VM instance and do the work there instead. Lecturers would usually have slides and would talk over them, expanding on some specific points, or would demo the specific tooling when necessary, e.g. usage of nmap, metasploitable, machine learning notebooks. The lectures were recorded which was actually a requirement of the initial course provider Springboard, otherwise they would be reluctant like we observed after upgrading to Masters. Recordings were invaluable as the lectures were being delivered in the evening and some of us would need to work later than expected. Another important part was assignments which were necessary to upload through Moodle system where the upload page would expire at a specific time. Finally there were evaluations at the end of the subject and those would either be a separate project, a live online exam or a timed assignment. In the case of a live exam you would get into a call with a lecturer, they would unlock the file with questions and the student would have some 3 hours to answer them and upload their answers. There was also a timed assignment which was similar to the exam but the student had more time to submit. Plagiarism, AI generated content was inspected by a Turnitin system, which would show the suspicious lines with a specific classification and a reference to the original, e.g. if you copy paste some paragraph from a book it would identify it as such would provide a book reference. Such a system encouraged personalized note taking to be able to use those at the time of the exam.

Once our classes started online someone created a whatsapp group (sorry I just do not remember who, but thank you!) for us all to join and have a location where to share general questions and vent the frustration. This group was invaluable as you would always be on top of everything.

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

It was quite intense and the tight deadlines would require to not just be present in the lectures but also manage your remaining time well (most of use were employed already) and complete the assignments in time. If there were 3 subjects per 3 months and they would always have some project in the middle and then an evaluation at the end, it leaves you with little time to prepare. I believe you could just try and wing it and the college would not be too harsh but then the whole point of taking part in the course makes little sense. I had a good footing due to my industry experience and took it as an opportunity to see how many gaps I have in understanding each of the subjects.

The first semester was a great setting stone in my case, I ended up writing a small "secure" app [3] for Secure Web Development as an assignment, which implements various techniques to make sure the app is secure. Controversially, data governance was one of those interesting subjects to me, it was fairly dry but the lecturer tried to explain the various aspects of the subject, there was a lot that I did not have a chance to experience at work so it was difficult to ingest it as well. Data governance is a documented field with good books to read and research (if you find yourself in the position that requires to implement it). There were great topics covering privacy, GDPR, legislation, corporate policies. Security Fundamentals subject necessitated to do an assignment which required to research recent cybersecurity incidents and do an analysis on them.

Then in the second semester we had one lecturer deliver two subjects - malware analysis and pentesting. There was a lot of hands on where we had to setup our VMs to be able to securely analyse malware or to carry out the pentesting. Malware analysis was evaluated based on 2 assignments where one focussed on building the lab environment and evaluating malware taken from the Zoo, without using the lab though, just online tooling like virusvault or any.run. Second assignment required to write a report about known malware and all the details about it, e.g. QBot/Qackbot. Pentesting was about the various tools you can use to do reconnaissance and evaluation of the system, in one assignment we did use recent hackthebox challenges and wrote a report about the process to try and take it down, second assignment required to make up a small company network challenge inclusive of devices and then evaluate and mitigate potential vulnerabilities. Third subject "crypto and blockchain" was academic in nature, it covered foundational cryptography, DHKE, RSA where we had to learn how to encrypt decrypt by hand (which was part of evaluation), but there was also some blockchain usage where students had to use metamask, send/receive crypto and write a small solidity contract. Crypto and blockchain had two assessments in the form of a timed online evaluation.

Final semester was a challenge 

## Thesis

TODO

## Overall value

TODO

[1] PGDip course summary https://www.ncirl.ie/Courses/NCI-Course-Details/course/PGDCYBE
[2] PGDip course subjects https://nci.akarisoftware.com/index.cfm/page/course/courseId/9049
[3] https://github.com/ivarprudnikov/secret-message-share




 