// =================== import packages ==================
import type { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
// ======================================================
import { generalResponse, getFileUrl } from '@/helper/common.helper';
import { Prisma } from '@prisma/client';
import { organizationKey } from '@/validationSchema/organization.validation.schema';
import { HttpException } from '@/exceptions/HttpException';
import { OrganizationService } from '@/services/organization.service';

export class OrganizationController {
  private stringKey = [
    'name',
    'phone',
    'mobile',
    'fax',
    'website',
    'description',
    'address1',
    'address2',
    'city',
    'state',
    'country',
    'zip',
  ];

  constructor(private organizationService: OrganizationService) {
    // do nothing.
  }

  public getOrganizationById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let id: number;
      if (req.params.id) {
        id = +req.params.id;
      } else {
        id = req.tokenData.organization_id;
      }
      const organization = await this.organizationService.getOrganizationById({ where: { id, is_deleted: false } });
      return generalResponse(res, organization, 'success', 'success', false, 200);
    } catch (error) {
      next(error);
    }
  };

  public getOrganizations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query } = req;
      const { limit = 10, page = 1, fields, exclude, sort, searchText } = query;

      // Per page data default 10
      const take = +limit;

      // Page number on skip data default 0
      const skip = (+page - 1) * +limit;

      // Dynamic nth level sorting

      const orderBy: Prisma.Enumerable<Prisma.OrganizationOrderByWithRelationAndSearchRelevanceInput> = [];
      if (typeof sort === 'object' && Object.keys(sort).length) {
        Object.keys(sort).forEach((el) => orderBy.push({ [el]: sort[el] }));
      }

      // Specific field get if not specify all field get
      const select: Prisma.OrganizationSelect = {};
      if (typeof fields === 'string' && fields.length) {
        fields.split(',').forEach((el) => (select[el] = true));
      } else {
        organizationKey.map((el) => (select[el] = true));
      }

      // Specific field remove
      if (typeof exclude === 'string' && exclude.length) {
        exclude.split(',').forEach((el) => (select[el] = false));
      }

      // search in modal string field
      const where: Prisma.OrganizationWhereInput = { is_deleted: false };
      if (typeof searchText === 'string') {
        const search: Prisma.Enumerable<Prisma.OrganizationWhereInput> = [];
        this.stringKey.forEach((el) => search.push({ [el]: { contains: searchText } }));
        where.OR = [...search];
      }

      const organization = await this.organizationService.getOrganizations({ skip, take, select, orderBy, where });
      return generalResponse(res, organization, 'success', 'success', false, 200);
    } catch (error) {
      next(error);
    }
  };

  public createOrganization = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tokenData } = req;
      // Static value
      const {
        organization_category,
        name,
        phone,
        mobile,
        fax,
        website,
        description,
        address1,
        address2,
        city,
        state,
        country,
        zip,
        settings = {},
      } = req.body;

      const organizationData: Prisma.OrganizationUncheckedCreateInput = {
        uuid: uuidv4(),
        organization_category,
        name,
        phone,
        mobile,
        fax,
        website,
        description,
        address1,
        address2,
        city,
        state,
        country,
        zip,
        settings,
        owner_id: tokenData.id,
      };

      const createOrganization = await this.organizationService.createOrganization({ data: organizationData });
      if (!createOrganization) {
        throw new HttpException(400, 'Organization creation failed!');
      }
      return generalResponse(res, createOrganization, 'success', 'success', false, 200);
    } catch (error) {
      next(error);
    }
  };

  public updateOrganization = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let id: number;
      if (req.params.id) {
        id = +req.params.id;
      } else {
        id = req.tokenData.organization_id;
      }
      const organization = await this.organizationService.getOrganizationById({ where: { id, is_deleted: false } });
      if (!organization) {
        throw new HttpException(400, 'Organization not exists');
      }
      const { ...otherData } = req.body;
      const updateData: Prisma.OrganizationUncheckedCreateInput = { ...otherData };
      Object.keys(otherData).forEach((el) => {
        if (!otherData[el]) {
          delete updateData[el];
        } else if (otherData[el] === 'null' || otherData[el] === 'undefined') {
          updateData[el] = '';
        }
      });

      if (req.files?.[0]) {
        // const filePath = req.files[0].path.split('/');
        // filePath.shift();
        // updateData.organization_logo = filePath.join('/');
        updateData.organization_logo = getFileUrl(req.files[0]);
      }

      const updateOrganization = await this.organizationService.updateOrganization({
        data: { ...updateData },
        where: { id },
      });
      return generalResponse(res, updateOrganization, 'success', 'success', false, 200);
    } catch (error) {
      next(error);
    }
  };

  deleteOrganizationById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = +req.params.id;
      const organization = await this.organizationService.getOrganizationById({ where: { id, is_deleted: false } });
      if (!organization || !organization.is_deleted) {
        throw new HttpException(400, 'Organization not exists');
      }

      const deletedOrganization = await this.organizationService.deleteOrganizationSoft(id);
      return generalResponse(res, deletedOrganization);
    } catch (error) {
      next(error);
    }
  };
}
