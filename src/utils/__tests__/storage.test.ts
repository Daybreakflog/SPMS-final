import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '../storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sets and gets a string value', () => {
    storage.set('name', 'Alice');
    expect(storage.get<string>('name')).toBe('Alice');
  });

  it('sets and gets an object', () => {
    const obj = { id: 1, role: 'admin' };
    storage.set('user', obj);
    expect(storage.get('user')).toEqual(obj);
  });

  it('returns null for non-existent key', () => {
    expect(storage.get('missing')).toBeNull();
  });

  it('removes a key', () => {
    storage.set('token', 'abc');
    storage.remove('token');
    expect(storage.get('token')).toBeNull();
  });

  it('clears only prefixed keys', () => {
    storage.set('a', 1);
    storage.set('b', 2);
    localStorage.setItem('other', 'keep');

    storage.clear();

    expect(storage.get('a')).toBeNull();
    expect(storage.get('b')).toBeNull();
    expect(localStorage.getItem('other')).toBe('keep');
  });
});
