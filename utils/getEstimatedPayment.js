const getEstimatedPayment = (price, intRate) => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    });

    const priceRaw = price * 1;
    const mortgageAmt = priceRaw * 0.8;
    const yearlyPrincipal = mortgageAmt / 30;
    const yearlyInterest = mortgageAmt * intRate;
    const estPropTaxes = price * 0.011;

    const totalYearly = yearlyPrincipal + yearlyInterest + estPropTaxes;

    const estMnthPmyt = Math.floor(totalYearly / 12);

    const totalMonPmtClean = formatter.format(estMnthPmyt);

    return totalMonPmtClean;
};

export default getEstimatedPayment;
