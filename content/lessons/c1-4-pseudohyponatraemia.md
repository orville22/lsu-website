---
title: "Pseudohyponatraemia: How Lipids and Proteins Distort Sodium Results"
slug: c1-4-pseudohyponatraemia
category: electrolytes
subtopic: Pseudohyponatraemia and analytical pitfalls
difficulty: intermediate
length: full
readingMinutes: 14
description: Why a milky or protein-rich sample can report a falsely low sodium on the main analyser, how direct ISE and measured osmolality expose it, and why low protein does the opposite.
upcoming: no
---

# Pseudohyponatraemia: How Lipids and Proteins Distort Sodium Results

## Learning objectives

- Explain why sodium is confined to plasma water, and how plasma solids change the sodium per litre of plasma.
- Describe how indirect and direct ion-selective electrodes differ, and the assumption that makes indirect ISE vulnerable.
- Recognise the clues to pseudohyponatraemia: lipaemia, a very high total protein, a discordant direct sodium, and a normal measured osmolality with an osmolal gap.
- Confirm pseudohyponatraemia with a direct ISE result, measured osmolality, or measurement after lipid removal.
- Explain why a low protein makes indirect ISE read falsely high.
- Distinguish pseudohyponatraemia from the real, translocational hyponatraemia of hyperglycaemia.

## The core concepts

### 1. Plasma isn't all water

A litre of plasma looks like a clear liquid, but it isn't all water. About 930 mL of it is water. The other 70 mL or so is solids: mostly protein, with some lipid [1].

Sodium dissolves only in the water. None of it sits inside a protein molecule or a lipid particle. So the concentration of sodium in plasma water is higher than the number we report. A typical result of 140 mmol/L of plasma corresponds to about 150 mmol per litre of plasma water, because 150 × 0.93 ≈ 140 [1].

@interactive(c1-2-plasma-litre "C1.2 visual · a litre of plasma")

The visual shows a normal litre beside a very lipaemic one. The sodium in the water is the same in both. What changes is how much of the litre is water.

> **Key idea**
> Sodium lives in plasma water. Anything else that takes up space in the litre leaves less room for the water, and so for the sodium.

### 2. Two ways to measure sodium

Almost every sodium result today comes from an ion-selective electrode (ISE). An ISE responds to sodium ions in the water it touches. There are two ways to present the sample to it [2,3]:

- **Indirect ISE.** The main chemistry analyser takes a small, fixed volume of serum or plasma and dilutes it with a much larger volume of diluent. It measures sodium in the diluted mix and multiplies back by the dilution factor. Most high-throughput laboratory analysers work this way [3].
- **Direct ISE.** Blood gas and point-of-care analysers present the undiluted sample straight to the electrode. The electrode senses sodium in the plasma water itself [2].

Both report in mmol/L of plasma. Direct ISE converts its reading using the normal water fraction of 0.93, so that in a normal sample the two methods agree [1,4]. In most patients they do.

**Quick check.** A blood gas analyser measures sodium without diluting the sample. Which method is that? *Answer: direct ISE.*

### 3. The hidden assumption, and when it breaks

Indirect ISE knows exactly how much sample it took. It doesn't know how much of that sample was water. It assumes the usual 93%.

When lipid or protein takes up more of the sample than usual, that assumption fails. The fixed volume holds less water, so it holds less sodium, although the sodium concentration in the water is normal. After dilution and multiplication, the analyser reports a falsely low sodium [3,1]. This is the **electrolyte exclusion effect**: the solids exclude water, and the electrolytes with it. The falsely low sodium it causes is **pseudohyponatraemia**.

The size of the error tracks the solids. In Aziz and colleagues' worked model, with sodium in plasma water fixed at 151 mmol/L, plasma sodium reads 140 when solids are 7% of the volume, 130 when they are 14%, and 119 when they are 21% [1]. Doubling the solids costs about 10 mmol/L.

Direct ISE isn't fooled, because the electrode reads the water directly. However much space the solids take, the water it touches is normal [1,2].

**Proposed site visual · the water-fraction slider.** Slide lipid or protein up and watch the water share of the litre shrink. Indirect sodium falls while direct sodium stays put. Built from the case's numbers: 150 mmol/L in water, 0.93 normal, 0.85 in the case.

> **Go deeper · estimating plasma water**
> Waugh's formula estimates plasma water from protein and lipid: water (%) = 99.1 − 0.73 × protein (g/dL) − 1.03 × lipid (g/dL) [5,1]. It shows why protein usually causes smaller errors than lipaemia. A total protein of 118 g/L lowers the water share by only about 3.5%: an indirect sodium of about 134 instead of 139 mmol/L. To fall into the 120s takes the much larger solids load of severe lipaemia. Treat these as estimates: a direct measurement is better than a calculated correction.

### 4. Lipaemia: the version you can see

A lipaemic sample is turbid or milky. The turbidity comes from large, triglyceride-rich lipoproteins: chylomicrons and large very-low-density lipoproteins. Smaller particles such as HDL and LDL don't make a sample lipaemic [6]. The most common causes are a sample taken too soon after a meal, or during an infusion of lipid emulsion [6]. Severe hypertriglyceridaemia, as in the case below, produces the same picture.

Lipaemia is also the one interference that can be removed. Ultracentrifugation separates the lipid layer, and the analyte can then be measured in the clear sample beneath it [6]. That's how the problem was first shown: in 1955, Albrink and colleagues found misleadingly low electrolytes in milky sera, and normal or nearly normal results once the lipids were removed by ultracentrifugation [7].

### 5. Paraprotein: the version you can't see

Very high protein causes the same exclusion effect, most often from the paraprotein of myeloma [1]. But a high-protein sample can look perfectly clear. Nothing about its appearance gives it away. The clue is in the numbers: a total protein far above normal, a sodium that doesn't fit the patient, and an osmolal gap.

**Quick check.** A clear sample has sodium 133 mmol/L by indirect ISE and total protein 115 g/L. What would you check? *Answer: a direct ISE sodium. The high protein can lower an indirect result.*

### 6. The same assumption, the other way

The assumption fails in both directions. When protein is low, the sample holds more water than the analyser assumes, so indirect ISE reads too high: pseudohypernatraemia, or a falsely normal sodium in a patient who is really hyponatraemic (pseudonormonatraemia) [1].

This is common in hospital, not just a curiosity. In a study at an Australian tertiary referral hospital, indirect and direct sodium were predicted to differ by 4 mmol/L or more in 25% of intensive care samples. Almost all (97%) of those were in samples with low protein, where indirect read higher than direct [8]. The authors recommended that hospital laboratories consider standardising on direct ISE for sodium [8].

> **Key idea**
> Indirect ISE is right only when the sample is about 93% water. High protein or lipid: it reads low. Low protein: it reads high.

## The case

*Illustrative case; not a real patient.*

A 52-year-old man has routine bloods at his GP. He feels well. The sample arrives at the lab grossly lipaemic, and the main analyser reports a sodium of 128 mmol/L.

Before the result goes out, the scientist on the bench reruns the same sample on the lab's blood gas analyser: sodium 139 mmol/L.

> **Lab report card**
> Main analyser (indirect ISE): Sodium 128 mmol/L (135–145) · Glucose 5.5 mmol/L · Urea 5.0 mmol/L · Triglycerides 60 mmol/L · Total protein 72 g/L. Blood gas analyser (direct ISE), same sample: Sodium 139 mmol/L. Measured osmolality, freezing point: 289 mmol/kg (275–295).

Same patient, same tube, same morning. One of these numbers is wrong. Which one, and how would you show it?

This case is also the subject of LSU Episode 1. The sections below give you what you need to answer it.

## Supporting concepts

### Confirming it

Three independent checks can confirm pseudohyponatraemia:

1. **A direct ISE sodium** on the same sample. It isn't affected by the water fraction [1,2].
2. **Measured osmolality and the osmolal gap.** The osmometer measures the particles in the sample's water, so measured osmolality stays normal in pseudohyponatraemia [1]. The calculated osmolality uses the falsely low sodium, so a gap opens (C1.2, concept 5).
3. **Remeasuring after lipid removal.** Ultracentrifuge the sample and measure sodium in the clear layer [6,7]. This only works for lipaemia, not protein.

### Why it matters

Pseudohyponatraemia doesn't need treatment, so any attempt to correct it can do harm [1]. Patients with misdiagnosed pseudohyponatraemia have been given fluid restriction and saline, and severe neurological harm and deaths have been reported after hypertonic saline [1]. The cost of a falsely low sodium is the treatment it can trigger [3].

> **Common misconception · "hyperglycaemia causes pseudohyponatraemia"**
> It doesn't. In uncontrolled hyperglycaemia, glucose holds water outside cells and genuinely dilutes the sodium. The sodium in plasma water is really low, and a direct ISE agrees. That's a real, translocational hyponatraemia, handled by correcting sodium for glucose (C1.3), not an analytical artefact [9,1].

### Direct ISE isn't perfect either

Direct ISE eliminates almost all cases of pseudohyponatraemia, with rare exceptions [1]. But direct methods are not all identical. In 9,910 intensive care samples, sodium by two different direct ISE analysers disagreed enough to make them unsafe to use interchangeably when the margin for error is small, as in hyponatraemia [10]. Report which method produced each result, and keep serial monitoring on one method where you can (C1.3).

### In the lab

Table: Catching pseudohyponatraemia in the laboratory

| Step | What to do | Watch out for |
| --- | --- | --- |
| Spot it | Lipaemia index and visual check on every sodium | Lipaemia indices vary between manufacturers and can give false positives [6] |
| Protein | Look at total protein with any unexpected sodium | A paraprotein sample can look completely clear |
| Confirm | Rerun sodium by direct ISE on the same sample [1] | Note the method on the report |
| Cross-check | Measured osmolality by freezing point; calculate the gap (C1.2) | A normal measured osmolality with a big gap fits pseudohyponatraemia [1] |
| Remove lipid | Ultracentrifuge and remeasure in the clear layer [6] | Works for lipaemia only |
| Report | Release the direct result, or withhold the indirect one with a comment | A falsely low sodium can trigger harmful treatment [1] |
| Low protein | Consider a direct sodium in intensive care and hypoproteinaemic patients [8] | Indirect ISE reads high when protein is low |

> **Go deeper · lab policy options (Advanced)**
> Laboratories handle this in different ways. They can reflex to direct ISE above a lipaemia index or total protein threshold, hold autoverification on those flags, or report sodium by direct ISE for intensive care samples as standard [8]. Each needs local validation of thresholds and method agreement.

## Cracking the case

**Which number is right?** 139 mmol/L. The direct ISE reads sodium in the plasma water, which the lipid can't dilute [1].

**Why does the main analyser read 128?** At a triglyceride of 60 mmol/L, lipid takes up a much larger share of each litre. In this case the water share is about 85% instead of 93%. With sodium normal in the water at about 150 mmol/L, indirect ISE reports 150 × 0.85 ≈ 128 mmol/L.

**How do you show it?** With measured osmolality. It's 289 mmol/kg: normal. Calculate it with the indirect sodium: 2 × 128 + 5.5 + 5.0 = 266.5, a gap of 22.5. Calculate it with the direct sodium: 2 × 139 + 5.5 + 5.0 = 288.5, a gap of 0.5. The gap disappears when the right sodium goes into the formula (C1.2).

So the report should carry the direct ISE sodium of 139 mmol/L, with a comment that the indirect result was affected by gross lipaemia. No fluid restriction, no saline. What needs attention is the triglyceride of 60 mmol/L.

> **The principle to take with you**
> A method's assumptions can fail when the sample changes. Indirect ISE assumes plasma is 93% water; when it isn't, the sodium is wrong, and the lab is the one place that can see it.

## Key takeaways

- Sodium lives in plasma water, about 93% of plasma; around 150 mmol/L in water reports as 140 mmol/L of plasma.
- Indirect ISE dilutes a fixed volume and assumes 93% water; direct ISE measures the water undiluted.
- High lipid or protein shrinks the water share, so indirect ISE reads falsely low: pseudohyponatraemia.
- Lipaemia is visible and removable by ultracentrifugation; a paraprotein sample can look clear.
- Confirm with a direct ISE sodium and a normal measured osmolality with an osmolal gap.
- Low protein does the opposite: indirect ISE reads falsely high, common in intensive care.
- Hyperglycaemia causes a real, translocational hyponatraemia, not pseudohyponatraemia.

## Try it

**Q1 · multiple choice.** Which sodium method is affected by a change in the plasma water fraction?

- A. Direct ISE on a blood gas analyser
- B. Indirect ISE on the main chemistry analyser
- C. Both equally
- D. Neither

*Answer:* B. Indirect ISE dilutes a fixed volume and assumes a normal water fraction [3,1].

**Q2 · calculation.** Sodium in plasma water is 150 mmol/L. A grossly lipaemic sample has a water share of 0.88. What will indirect ISE report, and what will direct ISE report?

*Model answer:* Indirect: 150 × 0.88 = 132 mmol/L. Direct: converts with the normal fraction, 150 × 0.93 ≈ 140 mmol/L.

**Q3 · multiple choice.** Sodium 126 mmol/L by indirect ISE, glucose 5 mmol/L, urea 5 mmol/L, measured osmolality 288 mmol/kg, sample milky. What's the best next step?

- A. Fluid restriction
- B. Correct the sodium for glucose
- C. Measure sodium by direct ISE on the same sample
- D. Request a paired urine osmolality

*Answer:* C. A normal measured osmolality with a large gap (288 − 262 = 26) and a lipaemic sample points to pseudohyponatraemia [1].

**Q4 · short answer.** An intensive care patient with albumin and total protein well below normal has sodium 140 mmol/L on the main analyser. Why might this be misleading?

*Model answer:* Low protein means more of each litre is water than the analyser assumes, so indirect ISE reads falsely high. A direct sodium may be lower, revealing a pseudonormonatraemia [8,1].

**Q5 · multiple choice.** Which of these is a real (not pseudo) hyponatraemia?

- A. Hypertriglyceridaemia, indirect ISE
- B. Myeloma paraprotein, indirect ISE
- C. Uncontrolled hyperglycaemia
- D. None of these

*Answer:* C. Glucose holds water outside cells and genuinely dilutes the sodium; a direct ISE agrees [9].

**Q6 · short answer.** Why can ultracentrifugation fix a lipaemic sodium but not a paraprotein one?

*Model answer:* Ultracentrifugation separates the large lipid particles into a layer, leaving clear plasma with a normal water share to measure [6]. Proteins stay dissolved, so they can't be spun out, and a direct ISE is needed instead.

## References

1. Aziz F, Sam R, Lew SQ, Massie L, Misra M, Roumelioti ME, et al. Pseudohyponatremia: mechanism, diagnosis, clinical associations and management. J Clin Med. 2023;12(12):4076. doi:10.3390/jcm12124076
2. Dimeski G, Badrick T, St John A. Ion selective electrodes (ISEs) and interferences — a review. Clin Chim Acta. 2010;411(5–6):309–17. doi:10.1016/j.cca.2009.12.005
3. Fortgens P, Pillay TS. Pseudohyponatremia revisited: a modern-day pitfall. Arch Pathol Lab Med. 2011;135(4):516–9. doi:10.5858/2010-0018-RS.1
4. Burnett RW, Covington AK, Fogh-Andersen N, et al. Recommendations for measurement of and conventions for reporting sodium and potassium by ion-selective electrodes in undiluted serum, plasma or whole blood. Clin Chem Lab Med. 2000;38(10):1065–71. doi:10.1515/CCLM.2000.159
5. Waugh WH. Utility of expressing serum sodium per unit of water in assessing hyponatremia. Metabolism. 1969;18(8):706–12. doi:10.1016/0026-0495(69)90085-7
6. Nikolac N. Lipemia: causes, interference mechanisms, detection and management. Biochem Med (Zagreb). 2014;24(1):57–67. doi:10.11613/BM.2014.008
7. Albrink MJ, Hald PM, Man EB, Peters JP. The displacement of serum water by the lipids of hyperlipemic serum; a new method for the rapid determination of serum water. J Clin Invest. 1955;34(10):1483–8. doi:10.1172/JCI103199
8. Dimeski G, Morgan TJ, Presneill JJ, Venkatesh B. Disagreement between ion selective electrode direct and indirect sodium measurements: estimation of the problem in a tertiary referral hospital. J Crit Care. 2012;27(3):326.e9–16. doi:10.1016/j.jcrc.2011.11.003
9. Spasovski G, Vanholder R, Allolio B, Annane D, Ball S, Bichet D, et al. Clinical practice guideline on diagnosis and treatment of hyponatraemia. Eur J Endocrinol. 2014;170(3):G1–47. doi:10.1530/EJE-13-1020
10. Weld BA, Morgan TJ, Presneill JJ, et al. Plasma sodium measurements by direct ion selective methods in laboratory and point of care may not be clinically interchangeable. J Clin Monit Comput. 2017;31:1103. doi:10.1007/s10877-016-9938-1
