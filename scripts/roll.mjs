export { roll };
let EXPLAIN_ANYWAY = true;

async function roll(tag, dice, advantage = 0, crittingOn = 6, tension = 0, tensionx = 0, bonus = 0) {
    return await rollImpl(
        tag,
        parseInt(dice),
        parseInt(advantage),
        parseInt(crittingOn),
        parseInt(tension),
        parseInt(tensionx),
        parseInt(bonus)
    )
}

async function rollImpl(tag, dice, advantage, crittingOn, tension, tensionx, bonus) {
    let r = new Roll(`${dice + advantage}d6x>=${crittingOn}cs>=4`);
    await r.evaluate();
    let totalBonus = (tension * tensionx) + bonus;
    if (tensionx === 0) { tension = 0; } // for explainer

    let crits = r.dice[0].results.filter(die => die.exploded).length
    let successes = r.dice[0].results.filter(die => die.success).length
    // YOU CAN'T MISS?!
    let result = Math.max(0, successes + totalBonus) // Weakened produces negative bonus

    return `
        <table>
            ${explain(tag, dice, EXPLAIN_ANYWAY)}
            ${explain("Advantage", advantage)}
            ${explain("Critting On", crittingOn)}
            ${explain("Tension", tension)}
            ${explain("Tension X", tensionx)}
            ${explain("Bonus", bonus)}
            ${explain("Crits", crits)}
            ${explain("Hits", r.toAnchor().outerHTML, EXPLAIN_ANYWAY)}
            ${explain("Result", result, EXPLAIN_ANYWAY)}
        </table>
    `;
}

function explain(tag, value, explainAnyway = false) {
    if (explainAnyway || value !== 0) {
        return `<tr><td><strong>${tag}</strong></td><td><strong>${value}</strong></td></tr>`;
    }
    return "";
}
