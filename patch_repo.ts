import * as fs from 'fs';
const path = 'src/common/base/base.repository.ts';
let code = fs.readFileSync(path, 'utf8');

const saveMethod = `
  async save(
    entity: DeepPartial<T>,
    repository?: Repository<T>,
  ): Promise<T> {
    const service = repository || this.repository;
    return await service.save(entity);
  }
`;

if(!code.includes('async save(')) {
    code = code.replace('async update(', saveMethod + '\n  async update(')
    fs.writeFileSync(path, code);
}
