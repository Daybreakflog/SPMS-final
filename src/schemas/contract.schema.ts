import { z } from 'zod';

/** 合同金额上限（元） */
export const MAX_AMOUNT = 10_000_000;

/**
 * 合同表单字段级增强校验 schema。
 * 金额范围、单元号格式等增强规则，必填与日期先后关系另行处理。
 */
export const contractSchema = z.object({
  rentAmount: z
    .number()
    .gt(0, '月租金需大于 0')
    .max(MAX_AMOUNT, `月租金不超过 ${MAX_AMOUNT.toLocaleString()} 元`),
  depositAmount: z
    .number()
    .min(0, '押金不能为负')
    .max(MAX_AMOUNT, `押金不超过 ${MAX_AMOUNT.toLocaleString()} 元`),
});
