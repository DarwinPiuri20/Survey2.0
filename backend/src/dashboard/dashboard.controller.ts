import { Controller, Get, Query, Param, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardFiltersDto } from './dto/dashboard-filters.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('general')
  @Roles('admin', 'validator', 'seller')
  getGeneralStats(
    @Request() req,
    @Query() filters: DashboardFiltersDto,
  ) {
    return this.dashboardService.getGeneralStats(filters, req.user.role, req.user.userId);
  }

  @Get('seller/:sellerId')
  @Roles('admin', 'validator', 'seller')
  getSellerStats(
    @Param('sellerId', ParseUUIDPipe) sellerId: string,
    @Query() filters: DashboardFiltersDto,
    @Request() req,
  ) {
    // Si es un vendedor, solo puede ver sus propias estadísticas
    if (req.user.role === 'seller' && req.user.userId !== sellerId) {
      throw new Error('No tienes permiso para ver las estadísticas de este vendedor');
    }
    
    return this.dashboardService.getSellerStats(sellerId, filters);
  }

  @Get('stores')
  @Roles('admin', 'validator')
  getStoreStats(@Query() filters: DashboardFiltersDto) {
    return this.dashboardService.getStoreStats(filters);
  }

  @Get('export')
  @Roles('admin')
  getExportData(@Query() filters: DashboardFiltersDto) {
    return this.dashboardService.getExportData(filters);
  }
  
  @Get('categories')
  @Roles('admin', 'validator', 'seller')
  getCategoryStats(
    @Request() req,
    @Query() filters: DashboardFiltersDto,
  ) {
    return this.dashboardService.getCategoryStats(filters, req.user.role, req.user.userId);
  }
}
