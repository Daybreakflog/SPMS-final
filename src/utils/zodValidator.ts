import type { ZodType } from 'zod';
import type { Rule } from 'antd/es/form';

/**
 * 将单个 Zod 字段 schema 转换为 AntD Form 的校验规则。
 * 配合 Form.Item 的 validateTrigger（默认 onChange）实现实时校验反馈。
 *
 * @example
 * <Form.Item name="phone" rules={[zodFieldRule(renterSchema.shape.phone)]}>
 */
export function zodFieldRule(schema: ZodType): Rule {
  return {
    validator: async (_rule, value) => {
      // 空值交由 AntD 的 required 规则处理，此处只校验“格式/范围”等增强规则
      if (value === undefined || value === null || value === '') {
        return Promise.resolve();
      }
      const result = schema.safeParse(value);
      if (!result.success) {
        const message = result.error.issues[0]?.message ?? '输入校验未通过';
        return Promise.reject(new Error(message));
      }
      return Promise.resolve();
    },
  };
}

/**
 * 根据 Zod 对象 schema 的某个字段名生成 AntD 校验规则。
 * 当 schema 字段缺失时返回空规则（不报错），便于按需挂载。
 */
export function zodRuleFor<S extends { shape: Record<string, ZodType> }>(
  schema: S,
  field: keyof S['shape'],
): Rule[] {
  const fieldSchema = schema.shape[field as string];
  return fieldSchema ? [zodFieldRule(fieldSchema)] : [];
}
