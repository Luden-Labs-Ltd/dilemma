import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { I18nLang } from 'nestjs-i18n';
import { UserUuid } from '../../common/decorators/user-uuid.decorator';
import { DilemmasService } from './dilemmas.service';
import { DilemmaDetailsDto } from './dto/dilemma-details.dto';
import { DilemmaListItemDto } from './dto/dilemma-list-item.dto';

@ApiTags('dilemmas')
@Controller('dilemmas')
export class DilemmasController {
  constructor(private readonly dilemmasService: DilemmasService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of active dilemmas' })
  @ApiHeader({
    name: 'Accept-Language',
    required: false,
    description: 'Language preference (he, en, ru)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of dilemmas',
    type: [DilemmaListItemDto],
  })
  @HttpCode(HttpStatus.OK)
  async findAll(@I18nLang() lang: string): Promise<DilemmaListItemDto[]> {
    return this.dilemmasService.findAll(lang);
  }

  @Get(':name')
  @ApiOperation({ summary: 'Get dilemma details' })
  @ApiHeader({
    name: 'X-User-UUID',
    required: false,
    description: 'User UUID (optional)',
  })
  @ApiHeader({
    name: 'Accept-Language',
    required: false,
    description: 'Language preference (he, en, ru)',
  })
  @ApiResponse({
    status: 200,
    description: 'Dilemma details',
    type: DilemmaDetailsDto,
  })
  @ApiResponse({ status: 404, description: 'Dilemma not found' })
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('name') name: string,
    @UserUuid() clientUuid?: string,
    @I18nLang() lang?: string,
  ): Promise<DilemmaDetailsDto> {
    return this.dilemmasService.findOneByName(name, clientUuid, lang);
  }
}
