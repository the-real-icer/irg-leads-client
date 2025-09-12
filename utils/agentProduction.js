const agentProduction = (homes) => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    });

    let totalVolume = 0;

    for (const home of homes) {
        totalVolume += home.price_raw;
    }

    return formatter.format(totalVolume);
};

export default agentProduction;
