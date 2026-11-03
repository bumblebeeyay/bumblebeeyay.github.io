import { describe, expect, it } from 'vitest';
import { ContentError, indexProjects, parseGarden } from './parseGarden';

const project = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  title: 'Title',
  summary: 'Summary',
  description: 'Description',
  links: [{ label: 'Code', href: 'https://example.com' }],
  flower: { shape: 'daisy', petal: '#ffffff', outline: '#000', core: '#ffcc00' },
  ...overrides,
});

const garden = (projects: unknown[]) => ({
  welcome: { kicker: 'Welcome to', title: 'Garden', subtitle: 'Hello', hint: 'Scroll' },
  areas: [{ id: 'public', title: 'Public', projects }],
  footer: 'Footer',
});

describe('parseGarden', () => {
  it('accepts valid content', () => {
    const content = parseGarden(garden([project('a')]));
    expect(content.areas[0]?.projects[0]?.flower.shape).toBe('daisy');
  });

  it('defaults missing links to empty lists', () => {
    const content = parseGarden(garden([project('a', { links: undefined })]));
    expect(content.areas[0]?.projects[0]?.links).toEqual([]);
  });

  it('names the exact field that is wrong', () => {
    const bad = garden([project('a', { flower: { shape: 'cactus', petal: '#fff', outline: '#000', core: '#ff0' } })]);
    expect(() => parseGarden(bad)).toThrow('areas[0].projects[0].flower.shape');
  });

  it('rejects bad colors', () => {
    const bad = garden([project('a', { flower: { shape: 'daisy', petal: 'red', outline: '#000', core: '#ff0' } })]);
    expect(() => parseGarden(bad)).toThrow(ContentError);
  });

  it('rejects javascript: links', () => {
    const bad = garden([project('a', { links: [{ label: 'x', href: 'javascript:alert(1)' }] })]);
    expect(() => parseGarden(bad)).toThrow('links[0].href');
  });

  it('rejects duplicate ids', () => {
    expect(() => parseGarden(garden([project('a'), project('a')]))).toThrow('used more than once');
  });
});

describe('indexProjects', () => {
  it('finds projects and their area by id', () => {
    const { areas } = parseGarden(garden([project('a'), project('b')]));
    const entry = indexProjects(areas).get('b');
    expect(entry?.project.id).toBe('b');
    expect(entry?.area.id).toBe('public');
  });
});
