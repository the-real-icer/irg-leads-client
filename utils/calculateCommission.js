import { TRANSACTION_FEES } from '../constants/transactionFees';

const round2 = (n) => Math.round((n || 0) * 100) / 100;

const normalizeNonNegativeMoney = (value) => {
    if (value === null || value === undefined || value === '') return 0;

    const parsed = Number(String(value).replace(/[$,]/g, ''));
    if (!Number.isFinite(parsed) || parsed < 0) return 0;

    return parsed;
};

/**
 * Full commission calculation chain.
 *
 * Step 1: Sales Price x Commission % = Total Commission Amount
 * Step 2: Total Commission - TC Fee = After TC Fee
 * Step 3: Referral Fee % x Total Commission Amount (capped at After TC Fee)
 *         After TC Fee - Referral Fee = Total Brokerage Commission
 * Step 4: Agent/Brokerage split applied to Total Brokerage Commission
 * Step 5: Client Credits deducted from Agent Gross
 *
 * @param {Object} params
 * @param {number} params.salesPrice
 * @param {number} params.commissionPercentage  - e.g. 2.5 = 2.5%
 * @param {string} params.representationType    - 'buyer' | 'seller' | 'both'
 * @param {number} params.referralFeePercentage - e.g. 25 = 25% of total commission
 * @param {number} params.commissionSplit       - agent split e.g. 80 = 80%
 * @param {number} params.clientCredits         - total dollar amount (pre-summed)
 * @param {number} params.agentLoanRepaymentAmount - brokerage loan/advance repayment
 */
export const calculateCommission = ({
    salesPrice,
    commissionPercentage,
    representationType,
    referralFeePercentage,
    commissionSplit,
    clientCredits,
    agentLoanRepaymentAmount,
}) => {
    const split = commissionSplit || 0;
    const loanRepayment = normalizeNonNegativeMoney(agentLoanRepaymentAmount);

    // Guard — return zeroes if required inputs missing
    if (!salesPrice || !commissionPercentage) {
        return {
            totalCommissionAmount: 0,
            tcFee: 0,
            referralFeeAmount: 0,
            totalBrokerageCommission: 0,
            agentCommissionGross: 0,
            brokerageCommissionGross: 0,
            agentNetCommission: 0,
            brokerageNetCommission: 0,
            agentSplitPercentageUsed: split,
            agentLoanRepaymentAmount: round2(loanRepayment),
        };
    }

    // Step 1 — Total Commission Amount
    const totalCommissionAmount = (salesPrice * commissionPercentage) / 100;

    // Step 2 — TC Fee
    const tcFee =
        representationType === 'both'
            ? TRANSACTION_FEES.TC_FEE_DUAL
            : TRANSACTION_FEES.TC_FEE_SINGLE_SIDE;
    const afterTcFee = totalCommissionAmount - tcFee;

    // Step 3 — Referral Fee (% of total commission, NOT sales price)
    const maxReferral = Math.max(0, afterTcFee);
    const referralFeeAmount =
        referralFeePercentage > 0
            ? Math.min(
                  (totalCommissionAmount * referralFeePercentage) / 100,
                  maxReferral,
              )
            : 0;
    const totalBrokerageCommission = afterTcFee - referralFeeAmount;

    // Step 4 — Agent / Brokerage Split
    const splitDecimal = split / 100;
    const agentCommissionGross = totalBrokerageCommission * splitDecimal;
    const brokerageCommissionGross = totalBrokerageCommission * (1 - splitDecimal);

    // Step 5 — Client Credits (deducted from agent only)
    const credits = clientCredits || 0;
    // Loan repayment reduces only agent net. Net can go negative when deductions
    // exceed gross commission; unpaid balance tracking is outside transactions.
    const agentNetCommission = agentCommissionGross - credits - loanRepayment;
    const brokerageNetCommission = brokerageCommissionGross;

    return {
        totalCommissionAmount: round2(totalCommissionAmount),
        tcFee: round2(tcFee),
        referralFeeAmount: round2(referralFeeAmount),
        totalBrokerageCommission: round2(totalBrokerageCommission),
        agentCommissionGross: round2(agentCommissionGross),
        brokerageCommissionGross: round2(brokerageCommissionGross),
        agentLoanRepaymentAmount: round2(loanRepayment),
        agentNetCommission: round2(agentNetCommission),
        brokerageNetCommission: round2(brokerageNetCommission),
        agentSplitPercentageUsed: split,
    };
};
