import { CreateShippingDto } from "./../controller/create-shipping.dto";
import { Service } from "typedi";
import { Shipping } from "../model/shipping.model";

@Service()
export class ShippingService {
  constructor() {}

  async getShipping(id: string) {
    const shipping = await Shipping.findOne({ id });

    if (!shipping) {
      throw new Error("User not found with this order");
    }

    return shipping;
  }

  async createShipping(data: CreateShippingDto) {
    const result = await Shipping.create(data);

    return result;
  }
}
