# Question sources

JSON copies of lesson question sets, in the format `/admin` → Import & export reads (see `docs/IMPORTS.md`). Imports always arrive as Draft; each question is published after scientific review.

Each lesson has 25 questions: 10 tagged `core` (4 beginner, 4 intermediate, 2 advanced) and 15 tagged `reserve` (4, 7, 4). The quiz engine draws from the whole published bank and prefers questions a learner hasn't seen recently, so the reserves keep repeat attempts fresh. Options are shuffled when a quiz is built.
