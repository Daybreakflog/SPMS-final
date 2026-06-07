import { z } from 'zod';

/** 中国大陆手机号 */
export const phoneRegex = /^1[3-9]\d{9}$/;
/** 邮箱 */
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** 身份证号（15 或 18 位） */
export const idCardRegex = /(^\d{15}$)|(^\d{17}[\dXx]$)/;

/**
 * 租户表单字段级增强校验 schema。
 * 仅承载“格式/长度”等增强规则，必填由 AntD 的 required 规则负责，
 * 二者通过 zodFieldRule 桥接到 Form.Item，实现 onChange 实时反馈。
 */
export const renterSchema = z.object({
  name: z.string().trim().min(2, '姓名至少 2 个字符').max(20, '姓名不超过 20 个字符'),
  idNumber: z.string().trim().min(6, '证件号码至少 6 位').max(30, '证件号码过长'),
  phone: z.string().trim().regex(phoneRegex, '请输入正确的手机号'),
  phoneAlt: z.string().trim().regex(phoneRegex, '请输入正确的备用手机号'),
  email: z.string().trim().regex(emailRegex, '请输入正确的邮箱'),
});
