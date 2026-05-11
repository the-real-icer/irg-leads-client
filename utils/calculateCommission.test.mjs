import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateCommission } from './calculateCommission';

const baseParams = {
    salesPrice: 100000,
    commissionPercentage: 3,
    representationType: 'buyer',
    referralFeePercentage: 0,
    commissionSplit: 80,
    clientCredits: 0,
};

test('calculateCommission preserves existing net when loan repayment is omitted', () => {
    const result = calculateCommission(baseParams);

    assert.equal(result.agentCommissionGross, 2000);
    assert.equal(result.agentNetCommission, 2000);
    assert.equal(result.brokerageNetCommission, 500);
    assert.equal(result.agentLoanRepaymentAmount, 0);
});

test('calculateCommission subtracts loan repayment from agent net only', () => {
    const result = calculateCommission({
        ...baseParams,
        agentLoanRepaymentAmount: 500,
    });

    assert.equal(result.agentCommissionGross, 2000);
    assert.equal(result.agentNetCommission, 1500);
    assert.equal(result.brokerageNetCommission, 500);
    assert.equal(result.agentLoanRepaymentAmount, 500);
});

test('calculateCommission treats explicit zero loan repayment as no deduction', () => {
    const result = calculateCommission({
        ...baseParams,
        agentLoanRepaymentAmount: 0,
    });

    assert.equal(result.agentNetCommission, 2000);
    assert.equal(result.brokerageNetCommission, 500);
    assert.equal(result.agentLoanRepaymentAmount, 0);
});

test('calculateCommission subtracts both client credits and loan repayment', () => {
    const result = calculateCommission({
        ...baseParams,
        clientCredits: 250.25,
        agentLoanRepaymentAmount: 499.75,
    });

    assert.equal(result.agentNetCommission, 1250);
    assert.equal(result.agentLoanRepaymentAmount, 499.75);
});

test('calculateCommission normalizes negative loan repayment to zero', () => {
    const result = calculateCommission({
        ...baseParams,
        agentLoanRepaymentAmount: -500,
    });

    assert.equal(result.agentNetCommission, 2000);
    assert.equal(result.agentLoanRepaymentAmount, 0);
});
