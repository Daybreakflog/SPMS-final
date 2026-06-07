import { z } from 'zod';

/** 账单金额上限（元） */
export const MAX_BILL_AMOUNT = 10_000_000;

/**
 * 账单表单字段级增强校验 schema。
 * 金额需大于 0 且在合理范围内，必填由 AntD required 规则负责。
 */
export const billSchema = z.object({
  amount: z
    .number()
    .gt(0, '金额需大于 0')
    .max(MAX_BILL_AMOUNT, `金额不超过 ${MAX_BILL_AMOUNT.toLocaleString()} 元`),
});
