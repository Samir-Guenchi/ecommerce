import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Address } from '../entities';
import { AuthRequest } from '../middleware/auth.middleware';

export class AddressController {
  private addressRepository = AppDataSource.getRepository(Address);

  /**
   * Get all addresses for current user
   * GET /api/addresses
   */
  async getAllAddresses(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const addresses = await this.addressRepository.find({
        where: { userId: req.user.id },
        order: { isDefault: 'DESC', createdAt: 'DESC' },
      });

      res.status(200).json({ addresses });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get addresses' });
    }
  }

  /**
   * Create address
   * POST /api/addresses
   */
  async createAddress(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { name, addressLine1, addressLine2, city, stateProvince, postalCode, country, isDefault } = req.body;

      if (!addressLine1 || !city || !country) {
        res.status(400).json({ error: 'Address line 1, city, and country are required' });
        return;
      }

      // If setting as default, unset other defaults
      if (isDefault) {
        await this.addressRepository.update(
          { userId: req.user.id },
          { isDefault: false }
        );
      }

      const address = this.addressRepository.create({
        userId: req.user.id,
        name: name || null,
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        stateProvince: stateProvince || null,
        postalCode: postalCode || null,
        country,
        isDefault: isDefault || false,
      });

      const savedAddress = await this.addressRepository.save(address);

      res.status(201).json({
        message: 'Address created successfully',
        address: savedAddress,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to create address' });
    }
  }

  /**
   * Update address
   * PATCH /api/addresses/:id
   */
  async updateAddress(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const addressId = parseInt(req.params.id, 10);
      if (isNaN(addressId)) {
        res.status(400).json({ error: 'Invalid address ID' });
        return;
      }

      const address = await this.addressRepository.findOne({
        where: { id: addressId, userId: req.user.id },
      });

      if (!address) {
        res.status(404).json({ error: 'Address not found' });
        return;
      }

      // If setting as default, unset other defaults
      if (req.body.isDefault && !address.isDefault) {
        await this.addressRepository.update(
          { userId: req.user.id },
          { isDefault: false }
        );
      }

      if (req.body.name !== undefined) address.name = req.body.name;
      if (req.body.addressLine1 !== undefined) address.addressLine1 = req.body.addressLine1;
      if (req.body.addressLine2 !== undefined) address.addressLine2 = req.body.addressLine2;
      if (req.body.city !== undefined) address.city = req.body.city;
      if (req.body.stateProvince !== undefined) address.stateProvince = req.body.stateProvince;
      if (req.body.postalCode !== undefined) address.postalCode = req.body.postalCode;
      if (req.body.country !== undefined) address.country = req.body.country;
      if (req.body.isDefault !== undefined) address.isDefault = req.body.isDefault;

      const updatedAddress = await this.addressRepository.save(address);

      res.status(200).json({
        message: 'Address updated successfully',
        address: updatedAddress,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to update address' });
    }
  }

  /**
   * Delete address
   * DELETE /api/addresses/:id
   */
  async deleteAddress(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const addressId = parseInt(req.params.id, 10);
      if (isNaN(addressId)) {
        res.status(400).json({ error: 'Invalid address ID' });
        return;
      }

      const address = await this.addressRepository.findOne({
        where: { id: addressId, userId: req.user.id },
      });

      if (!address) {
        res.status(404).json({ error: 'Address not found' });
        return;
      }

      await this.addressRepository.remove(address);

      res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to delete address' });
    }
  }
}

export const addressController = new AddressController();



