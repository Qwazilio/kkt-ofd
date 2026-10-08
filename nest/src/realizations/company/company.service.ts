import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from '../../entities/company.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto) {
    const company = await this.companyRepository.findOne({
      where: { token: createCompanyDto.token },
    });
    if (company) throw new ConflictException('company already exists');
    const newCompany = this.companyRepository.create(createCompanyDto);
    return await this.companyRepository.save(newCompany);
  }

  async findAll() {
    return await this.companyRepository.find({
      select: {
        id: true,
        nickname: true,
        token: true,
      },
    });
  }

  async findOne(id: number) {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (company) throw new NotFoundException();
    return company;
  }

  update(id: number, updateCompanyDto: UpdateCompanyDto) {
    return `This action updates a #${id} company`;
  }

  async remove(id: number) {
    const { affected } = await this.companyRepository.delete(id);
    if (!affected) throw new NotFoundException('Company not found');
    return affected;
  }
}
