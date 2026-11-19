---
title: Osmolality and the Osmolal Gap
slug: c1-2-osmolality-osmolal-gap
category: electrolytes
subtopic: Osmolality and osmolal gap
difficulty: intermediate
length: full
readingMinutes: 14
description: How the lab measures osmolality, how to calculate it from sodium, glucose and urea, and what a gap between the two can tell you.
upcoming: no
---

# Osmolality and the Osmolal Gap

## Learning objectives

- Explain the difference between osmolality and osmolarity, and why the lab reports mmol/kg.
- Describe how a freezing point osmometer measures osmolality, and why vapour pressure osmometry can miss alcohols.
- Calculate osmolality from sodium, glucose and urea, and explain what each term stands for.
- Distinguish effective from ineffective osmoles, and explain why urea and ethanol raise osmolality without changing tonicity.
- Calculate an osmolal gap, correct it for ethanol, and list the main causes of a raised gap.
- Explain why a normal osmolal gap does not rule out a toxic alcohol.

## The core concepts

### 1. Osmolality counts particles, not mass

Osmolality is a count of the particles dissolved in plasma. It doesn't matter what the particles are or how heavy they are: a sodium ion, a glucose molecule and a urea molecule each count as one.

If it helps, picture a party. You could describe the crowd by how much everyone weighs, or by how many people came through the door. Osmolality is the headcount.

That's why it matters for water. Cell membranes are semi-permeable: water crosses them freely, while sodium and most other solutes cross only through specific channels and transporters, some passive and some, like the sodium pump, powered by energy [1]. Water moves by **osmosis** towards the side with more dissolved particles, so the particle count, not the mass of what's dissolved, decides where water goes (C1.1, concept 2).

There are two ways to express the count. **Osmolality** is particles per kilogram of water, in mmol/kg. **Osmolarity** is particles per litre of solution, in mmol/L. The lab measures osmolality, because a kilogram of water stays a kilogram whatever the temperature and however much fat or protein is in the sample [2]. A litre of plasma is only about 93% water; the rest is mostly protein and lipid. So the two are close but not identical [3].

> **Key idea**
> Osmolality is the count of dissolved particles per kilogram of water. Each particle counts once, whatever its size or mass.

> **Go deeper · the unit mismatch nobody mentions**
> The calculated value in concept 3 is built from results reported per litre, so strictly it is an osmolarity. The osmolal gap subtracts that from a measured osmolality. It works in practice because, in ordinary plasma, the two numbers sit close together, but it's one reason a small gap means little on its own [2].

### 2. How the lab measures it: the freezing point

Dissolved particles get in the way of water freezing. The more particles, the lower the freezing point. One osmole in a kilogram of water lowers it by 1.86 °C, so plasma at 290 mmol/kg freezes at about −0.54 °C [4]. Freezing point depression is a colligative property: it depends on how many particles are dissolved, not what they are. Lowering of vapour pressure is another, which is why both kinds of osmometer work [4].

A freezing point osmometer uses exactly that. It supercools a small sample below its freezing point, triggers ice to form, then reads the temperature at which ice and liquid are in equilibrium. That temperature converts directly to osmolality [4].

@interactive(c1-2-freezing-curve "C1.2 visual · the freezing curve")

Some labs use a vapour pressure osmometer instead. Instead of the freezing point, it measures how much the dissolved particles lower the vapour pressure of water above the sample. That works for most solutes, but not for volatile ones. Ethanol and methanol evaporate into the vapour themselves, so the instrument doesn't count them and the measured osmolality comes out too low. A published case shows the risk: a patient with methanol poisoning had no osmolal gap because the sample was run on a vapour pressure instrument. When an alcohol is suspected, only a freezing point result will do [5].

**Quick check.** Why can't a vapour pressure osmometer be used to look for an alcohol? *Answer: alcohols are volatile, so they escape into the vapour and don't lower the measured osmolality.*

### 3. Calculating osmolality from routine results

Most of the particles in plasma are sodium and the anions that travel with it, mainly chloride and bicarbonate, plus glucose and urea. So you can estimate osmolality from three results you already have:

$$\text{Calculated osmolality} = 2 \times \text{Na} + \text{glucose} + \text{urea}$$

All three are in mmol/L. Sodium is doubled to stand in for its partner anions: every positive charge in plasma is balanced by a negative one, so counting sodium twice roughly covers chloride and bicarbonate. The other ions are small enough to leave out [2]. In a healthy adult with sodium 140, glucose 5 and urea 5 mmol/L, that gives 290.

Dozens of formulas exist, some adding potassium or a constant. When 36 of them were compared against measured values, the average differences ranged up to 35 mmol/kg, and only four were within 1 mmol/kg [6]. The simple version above has held up well since an Australian study in 1987 [7], and an AACB working group has proposed it as a common formula for laboratories here [8].

> **Go deeper · why not include potassium?**
> Adding potassium makes the estimate a little higher, but the constants and coefficients in each formula were fitted to particular analysers and patients. Every formula has its own normal gap, so what matters most is that a lab uses one formula consistently and knows its own reference limits [6,8].

### 4. Not every particle moves water

This links back to tonicity (C1.1). A particle only pulls water out of cells if it stays outside them. Sodium stays in the extracellular fluid, so it's an **effective osmole**: it sets tonicity [1]. Glucose acts the same way when it builds up outside cells, as it does when insulin is lacking. With insulin, glucose moves into cells and is used, which is why insulin treatment brings tonicity down. Some organs, such as the brain and liver, take up glucose without insulin at all [9].

Urea and ethanol cross cell membranes freely. They raise the measured osmolality, but because they spread to both sides, they don't create a pull on water. They are **ineffective osmoles** [1,10]. That's why a patient with a urea of 40 mmol/L can have a high osmolality but cells that are neither swelling nor shrinking.

The practical version: tonicity (C1.1) is the part of osmolality that moves water, which is why it's also called effective osmolality. It's roughly 2 × Na + glucose. Leave out urea and ethanol.

@interactive(c1-2-cell-tonicity "C1.2 interactive I2 · effective and ineffective osmoles")

Add each solute in turn. The measured osmolality rises every time, but the cell only shrinks when the solute stays outside it.

**Quick check.** A patient's osmolality is high because their urea is 45 mmol/L. Are their brain cells shrinking? *Answer: no. Urea crosses cell membranes, so it doesn't change tonicity.*

### 5. The osmolal gap

Subtract the calculated osmolality from the measured osmolality and you get the **osmolal gap**:

$$\text{Osmolal gap} = \text{measured osmolality} - \text{calculated osmolality}$$

In most people the two nearly match. A large gap means something else is in the plasma in high molar concentration: a small, uncharged molecule the formula doesn't know about. Small matters because the gap counts particles, not grams: a light molecule adds many particles per gram (see the methanol panel below) [11]. By far the most common is ethanol [2].

Back at the party, the calculated osmolality is the guest list (sodium, glucose and urea) and the measured osmolality is the headcount at the door. The gap is everyone who turned up without being on the list.

@interactive(c1-2-gap-builder "C1.2 interactive I1 · the gap builder")

Try each situation, then change any value with the sliders. A large gap appears only when something the formula doesn't count is present, and that a lipaemic sample can make a gap that isn't real. In the 2 am case, switch the ethanol factor between 1.25 and 1.0: the residual gap moves from about 4 to 16 mmol/kg.

How big is "large"? The usual upper limit quoted is about 10 mmol/kg [8]. But the normal range is wide. In an emergency department study, the average gap was −2 with a standard deviation of 6, so healthy people fall anywhere from about −14 to +10 (two standard deviations either side) [12]. Measurement uncertainty in sodium, glucose, urea and osmolality alone adds about ±7 mmol/kg [8].

**Correcting for ethanol.** If ethanol has been measured, add it to the calculation. Each mmol/L of ethanol adds about 1.25 mmol/kg to the measured osmolality [13]. Some labs and studies use a factor of 1.0 instead [14]. What's left after the correction is the residual gap.

For scale: ethanol's molar mass is about 46 g/mol, so 50 mmol/L of ethanol is about 2.3 g/L (230 mg/dL).

> **Go deeper · where the 1.25 comes from**
> The factor was measured, not derived. Purssell and colleagues compared osmolal gaps with ethanol levels in patients, then added known amounts of ethanol to serum. Each mmol/L of ethanol raised the gap by about 1.21 to 1.28 mmol/kg [13].

> **Key idea**
> The osmolal gap is measured minus calculated osmolality. A large gap indicates an unmeasured osmole; a normal gap does not exclude one.

> **Go deeper · where the party analogy breaks**
> A real guest list doesn't double-count anyone. The formula does: it counts sodium twice to cover chloride and bicarbonate. And the headcount at the door has its own error. Those two approximations are why gaps of a few mmol/kg either side of zero are normal and mean nothing [6,8].

## The case

*Illustrative case; not a real patient.*

It's 2 am. The emergency department rings the lab about a 52-year-old man brought in by ambulance after being found drowsy in a park. He smells strongly of alcohol. His osmolality has come back at **352 mmol/kg**.

"That's huge," the registrar says. "Is all of that the alcohol, or has he drunk something else as well? Can you tell me from the bloods?"

> **Lab report card**
> Sodium 138 mmol/L (135–145) · Potassium 4.0 mmol/L · Chloride 102 mmol/L · Bicarbonate 24 mmol/L · Urea 4.5 mmol/L · Creatinine 80 µmol/L · Glucose 5.5 mmol/L · Measured osmolality 352 mmol/kg (275–295), freezing point method · Ethanol 50 mmol/L. All results from one blood sample, capped and analysed promptly.

You can already calculate the gap from concepts 3 and 5. The harder question is what it does and doesn't tell the registrar. The sections below fill in the rest.

## Supporting concepts

### What can raise the gap

Anything that adds a lot of small, uncharged particles the formula doesn't count can raise the gap. The list falls into three groups [2,11]:

- **Alcohols and glycols.** Ethanol is by far the most common. Methanol, ethylene glycol, isopropanol and propylene glycol (a solvent in some intravenous drugs) are the dangerous ones.
- **Other things given in hospital.** Mannitol, and glycine from bladder irrigation fluids.
- **The patient's own particles.** Ketoacidosis, lactic acidosis and kidney failure can all raise the gap a little, because they add particles the formula doesn't capture.

And one cause that isn't a real particle at all: **pseudohyponatraemia**. Very high lipids or protein take up plasma volume. The main analyser's indirect ion-selective electrode (ISE) dilutes a measured volume of whole plasma and assumes it's about 93% water. When lipid or protein takes up more of the litre, that assumption fails and the sodium reads falsely low [3]. The calculated osmolality drops, the measured osmolality doesn't, and a gap appears [2]. A direct ISE on a blood gas analyser measures sodium in the water itself, so comparing the two sorts it out (C1.4).

@interactive(c1-2-plasma-litre "C1.2 visual · a litre of plasma")

### The gap changes over time

A toxic alcohol raises the gap as soon as it's absorbed. The body then breaks it down into acids, starting with the enzyme alcohol dehydrogenase. The antidotes, fomepizole and ethanol itself, work by blocking that enzyme, which is why early treatment matters [15]. Methanol becomes formic acid; ethylene glycol becomes glycolic and oxalic acids. As that happens, the uncharged alcohol disappears and charged acids take its place. The osmolal gap falls while the anion gap rises and bicarbonate drops [11,15].

@interactive(c1-2-gap-time-course "C1.2 visual 2 · the osmolal gap and anion gap over time")

This is the diagnostic pitfall. A patient who arrives late can have a normal osmolal gap and a severe acidosis. A patient who arrives very early can have a large gap and a normal anion gap. Neither picture alone rules the poison in or out [11,15].

### Why a normal gap doesn't rule anything out

Because healthy people range from about −14 to +10 [12], a toxic alcohol can be present in a dangerous amount while the gap still looks "normal". Someone whose own baseline is −10 could carry 20 mmol/kg of extra particles and still show a gap of +10.

In a study of patients tested for methanol and ethylene glycol, a gap above 10 picked up every patient whose toxic alcohol level was high enough for dialysis to be recommended, but it also flagged many patients who did not need an antidote [14]. The gap is a quick screening tool. When a toxic alcohol is suspected, the answer is a specific measurement of the alcohol itself [14,15].

> **Go deeper · why methanol raises the gap more than ethylene glycol**
> The gap counts particles, not grams. Methanol is a small molecule (molar mass 32 g/mol); ethylene glycol is about twice as heavy (62 g/mol). Gram for gram, methanol adds about twice as many particles, so the same blood concentration in g/L gives a bigger gap [11].

### Reading the results

When a gap comes back raised, work through it in order:

1. **Check the method and the sample.** Was osmolality measured by freezing point? Were all the results from one sample, collected at the same time and kept capped [5,8]?
2. **Check the sodium.** Is there severe lipaemia or a very high protein that could make the sodium falsely low? If so, check a direct sodium (C1.4).
3. **Add in ethanol** if it's been measured, and look at the residual gap [13].
4. **Look at the acid-base results.** The anion gap, Na − (Cl + HCO₃), estimates the anions a routine panel doesn't measure [11]. A raised anion gap with a low bicarbonate alongside the osmolal gap makes a toxic alcohol more likely, but ketoacidosis and lactic acidosis can look similar [11].
5. **Say what the gap can't.** A normal residual gap does not exclude a toxic alcohol. If clinical suspicion remains, request specific methanol and ethylene glycol testing [14,15].

### In the lab

Osmolality is one of the simpler tests to run but one of the easiest to misread. The common pitfalls are below.

Table: Measuring osmolality and the osmolal gap

| Step | What to know | Watch out for |
| --- | --- | --- |
| Method | Freezing point depression is the standard for plasma [4] | Vapour pressure osmometers miss volatile alcohols [5] |
| Sample | Serum or lithium heparin plasma both work [8] | Keep the tube capped: alcohols are volatile |
| Timing | Na, glucose, urea, ethanol and osmolality all from the same sample | Results from different times make the gap meaningless |
| Stability | Up to 36 hours at room temperature before analysis in one evaluation [8] | Refrigerate if a long delay is expected [8] |
| Formula | Use one formula consistently and know your own gap reference limit [8] | Different formulas give different "normal" gaps [6,12] |
| Reporting | Report measured osmolality; calculate the gap with paired results | A gap from a calculated value alone is not possible |

> **Pre-analytical trap · the open tube**
> Volatile alcohols can escape from a sample left uncapped, for example on an analyser deck or while aliquoting. The measured osmolality falls, the gap shrinks, and a real toxic alcohol can be missed. Keep osmolality samples capped until they are run.

## Cracking the case

Back to the registrar's question: is all of that the alcohol?

Start with the calculation. His calculated osmolality is 2 × 138 + 5.5 + 4.5 = 286 mmol/kg. The measured value is 352, so the gap is 66.

Now add the ethanol. At 50 mmol/L and a factor of 1.25, ethanol accounts for about 62 mmol/kg [13]. That leaves a residual gap of about 4: within the normal range. His acid-base results agree. Bicarbonate is 24 mmol/L and the anion gap (138 − 102 − 24) is 12 mmol/L, so there is no sign of the acids a toxic alcohol leaves behind [11,15].

So the honest answer to the registrar has two parts:

- **What the lab can say:** the ethanol explains almost all of the osmolal gap, and there is no acidosis.
- **What it can't say:** that no toxic alcohol is present. A small amount can hide inside the normal range of the gap, and a very early sample can have no acidosis yet [12,15]. If the history or his progress raises the question, specific methanol and ethylene glycol testing gives the answer [14,15].

The ethanol factor also matters. With an ethanol factor of 1.0 instead of 1.25, the residual gap would be 16, and the same patient would look suspicious. Know which factor your lab uses before you interpret a residual gap [13,14].

> **The principle to take with you**
> A raised osmolal gap suggests an unmeasured osmole is present; a normal gap can never exclude one.

## Key takeaways

- Osmolality counts dissolved particles per kilogram of water; the lab reports it in mmol/kg.
- Measure it by freezing point depression. Vapour pressure osmometers miss volatile alcohols.
- Calculated osmolality = 2 × Na + glucose + urea, all in mmol/L.
- Sodium and glucose set tonicity. Urea and ethanol raise osmolality but cross cell membranes, so they don't move water.
- Osmolal gap = measured − calculated. About 10 mmol/kg is the usual upper limit, but the normal range is wide.
- Ethanol is the most common cause of a raised gap. Add 1.25 × ethanol (mmol/L) and read the residual gap.
- A normal gap never rules out a toxic alcohol; as the alcohol is broken down, the osmolal gap falls and the anion gap rises.

## Try it

**Q1 · multiple choice.** A patient may have drunk methanol. Which measurement is right for the osmolal gap?

- A. Vapour pressure osmometry
- B. Freezing point osmometry
- C. Calculated osmolality alone
- D. Either osmometer, as long as the sample is fresh

*Answer:* B. Methanol is **volatile**, so a vapour pressure osmometer can miss it entirely [5].

**Q2 · calculation.** Sodium 132 mmol/L, glucose 30 mmol/L, urea 6 mmol/L, measured osmolality 305 mmol/kg. Calculate the osmolality, the gap and the tonicity.

*Model answer:* calculated 2 × 132 + 30 + 6 = 300 mmol/kg; gap 305 − 300 = 5, which is normal. Tonicity is 2 × 132 + 30 = 294. The glucose is doing **real osmotic work** here, which is why the sodium is low (C1.3).

**Q3 · multiple choice.** Which of these raises measured osmolality without changing tonicity?

- A. Sodium
- B. Glucose, in a patient without insulin
- C. Urea
- D. Mannitol

*Answer:* C. Urea crosses cell membranes freely, so it is an **ineffective osmole** [1,10]. Glucose without insulin stays outside cells, so it does change tonicity [9].

**Q4 · calculation.** Sodium 140, glucose 5 and urea 5 mmol/L, ethanol 30 mmol/L, measured osmolality 330 mmol/kg. What is the residual gap?

*Model answer:* calculated without ethanol = 290. Ethanol adds 1.25 × 30 = 37.5. Calculated with ethanol = 327.5, so the residual gap is about 2.5: **fully explained by the ethanol** [13].

**Q5 · short answer.** In two or three sentences, explain why a normal osmolal gap does not rule out a toxic alcohol.

*Model answer:* The normal gap ranges widely, **from about −14 to +10**, so a dangerous amount of alcohol can still leave the gap "normal" [12]. And as a toxic alcohol is broken down into acids, **the osmolal gap falls while the anion gap rises**, so a late sample can show little gap at all [11,15].

**Q6 · multiple choice.** A grossly lipaemic sample has sodium 124 mmol/L by the main analyser, glucose 5 and urea 5 mmol/L, and measured osmolality 289 mmol/kg. What's the most likely explanation for the gap of 31?

- A. Ethanol
- B. Methanol
- C. A falsely low sodium from lipaemia (pseudohyponatraemia)
- D. Kidney failure

*Answer:* C. The lipid takes up plasma volume, so the indirect sodium reads low and the calculated osmolality falls, but the osmometer **measures the water phase** and stays normal [2]. **Check a direct sodium** (C1.4).

## References

1. Sterns RH. Disorders of plasma sodium — causes, consequences, and correction. N Engl J Med. 2015;372(1):55–65. doi:10.1056/NEJMra1404489
2. Gennari FJ. Current concepts. Serum osmolality. Uses and limitations. N Engl J Med. 1984;310(2):102–5. doi:10.1056/NEJM198401123100207
3. Kim GH. Pseudohyponatremia: does it matter in current clinical practice? Electrolyte Blood Press. 2006;4(2):77–82. doi:10.5049/EBP.2006.4.2.77
4. Sweeney TE, Beuchat CA. Limitations of methods of osmometry: measuring the osmolality of biological fluids. Am J Physiol. 1993;264(3 Pt 2):R469–80. doi:10.1152/ajpregu.1993.264.3.R469
5. Walker JA, Schwartzbard A, Krauss EA, Sherman RA, Eisinger RP. The missing gap. A pitfall in the diagnosis of alcohol intoxication by osmometry. Arch Intern Med. 1986;146(9):1843–4. doi:10.1001/archinte.146.9.1843
6. Fazekas AS, Funk GC, Klobassa DS, Rüther H, Ziegler I, Zander R, et al. Evaluation of 36 formulas for calculating plasma osmolality. Intensive Care Med. 2013;39(2):302–8. doi:10.1007/s00134-012-2691-0
7. Worthley LI, Guerin M, Pain RW. For calculating osmolality, the simplest formula is the best. Anaesth Intensive Care. 1987;15(2):199–202. doi:10.1177/0310057X8701500214
8. Choy KW, Wijeratne N, Lu ZX, Doery JC. Harmonisation of osmolal gap — can we use a common formula? Clin Biochem Rev. 2016;37(3):113–9. PMID: 27872505. Available from: https://pmc.ncbi.nlm.nih.gov/articles/PMC5111243
9. Tzamaloukas AH, Khitan ZJ, Glew RH, Roumelioti ME, Rondon-Berrios H, Elisaf MS, et al. Serum sodium concentration and tonicity in hyperglycemic crises: major influences and treatment implications. J Am Heart Assoc. 2019;8(19):e011786. doi:10.1161/JAHA.118.011786
10. Oster JR, Singer I. Hyponatremia, hyposmolality, and hypotonicity: tables and fables. Arch Intern Med. 1999;159(4):333–6. doi:10.1001/archinte.159.4.333
11. Kraut JA, Xing SX. Approach to the evaluation of a patient with an increased serum osmolal gap and high-anion-gap metabolic acidosis. Am J Kidney Dis. 2011;58(3):480–4. doi:10.1053/j.ajkd.2011.05.018
12. Hoffman RS, Smilkstein MJ, Howland MA, Goldfrank LR. Osmol gaps revisited: normal values and limitations. J Toxicol Clin Toxicol. 1993;31(1):81–93. doi:10.3109/15563659309000375
13. Purssell RA, Pudek M, Brubacher J, Abu-Laban RB. Derivation and validation of a formula to calculate the contribution of ethanol to the osmolal gap. Ann Emerg Med. 2001;38(6):653–9. doi:10.1067/mem.2001.119455
14. Lynd LD, Richardson KJ, Purssell RA, Abu-Laban RB, Brubacher JR, Lepik KJ, et al. An evaluation of the osmole gap as a screening test for toxic alcohol poisoning. BMC Emerg Med. 2008;8:5. doi:10.1186/1471-227X-8-5
15. Kraut JA, Mullins ME. Toxic alcohols. N Engl J Med. 2018;378(3):270–80. doi:10.1056/NEJMra1615295
