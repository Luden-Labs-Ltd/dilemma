import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiResponse({
    status: 200,
    description: 'List of dilemmas',
    type: [DilemmaListItemDto],
  })
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<DilemmaListItemDto[]> {
    return this.dilemmasService.findAll();
  }

  @Get(':name')
  @ApiOperation({ summary: 'Get dilemma details' })
  @ApiHeader({
    name: 'X-User-UUID',
    required: false,
    description: 'User UUID (optional)',
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
  ): Promise<DilemmaDetailsDto> {
    return this.dilemmasService.findOneByName(name, clientUuid);
  }
}
