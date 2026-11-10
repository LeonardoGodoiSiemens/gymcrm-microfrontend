// @vitest-environment node
import * as fs from 'fs';
import * as path from 'path';

/** Testes de arquitetura do frontend: organização por feature e acesso somente ao BFF. */
const SRC = path.resolve(__dirname, '../src');

function listFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? listFiles(full) : /\.(ts|tsx)$/.test(e.name) ? [full] : [];
  });
}
const rel = (f: string) => path.relative(SRC, f).split(path.sep).join('/');
const imports = (file: string) =>
  [...fs.readFileSync(file, 'utf8').matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
const resolveTarget = (file: string, spec: string) =>
  spec.startsWith('.') ? rel(path.resolve(path.dirname(file), spec)) : null;

describe('Frontend architecture rules', () => {
  const files = listFiles(SRC);

  it('features are vertical slices: no feature imports another feature', () => {
    const violations = files.filter((f) => rel(f).startsWith('features/')).flatMap((f) => {
      const own = rel(f).split('/')[1];
      return imports(f)
        .map((s) => resolveTarget(f, s))
        .filter((t): t is string => !!t && t.startsWith('features/') && t.split('/')[1] !== own)
        .map((t) => `${rel(f)} -> ${t}`);
    });
    expect(violations).toEqual([]);
  });

  it('shared code never depends on features', () => {
    const violations = files.filter((f) => rel(f).startsWith('shared/')).flatMap((f) =>
      imports(f).map((s) => resolveTarget(f, s)).filter((t) => t?.startsWith('features/')).map((t) => `${rel(f)} -> ${t}`));
    expect(violations).toEqual([]);
  });

  it('only shared/api uses fetch directly (everything goes through the API client)', () => {
    const offenders = files.filter((f) => !rel(f).startsWith('shared/api/') && /\bfetch\s*\(/.test(fs.readFileSync(f, 'utf8')));
    expect(offenders.map(rel)).toEqual([]);
  });

  it('never references microservice or function addresses (BFF only)', () => {
    const forbidden = /(localhost:(3001|3002|7071)|\.azurewebsites\.net|mongodb(\+srv)?:\/\/|database\.windows\.net)/;
    const offenders = files.filter((f) => forbidden.test(fs.readFileSync(f, 'utf8')));
    expect(offenders.map(rel)).toEqual([]);
  });

  it('every feature folder has a page/entry component and an api module', () => {
    const dir = path.join(SRC, 'features');
    for (const f of fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory())) {
      const names = fs.readdirSync(path.join(dir, f.name));
      expect(names.some((n) => /\.api\.ts$/.test(n))).toBe(true);
      expect(names.some((n) => /(Page|Dashboard)\.tsx$/.test(n))).toBe(true);
    }
  });
});
