import { AxiosResponse } from "axios";
import axiosInstance from "../helpers/http";
import {
  IReporterModel,
  IReportersModel,
  IUserModel,
} from "../interfaces/user.interface";
import { IResponse } from "../interfaces/response.interface";

export async function getUser(): Promise<AxiosResponse<IResponse<IUserModel>>> {
  return axiosInstance.get("user");
}

export async function reporterList(): Promise<AxiosResponse<IResponse<IReportersModel>>> {
  return axiosInstance.get("reporters");

}

export async function repoterData(reporterId: string) {
  return axiosInstance.get<
    AxiosResponse<IResponse<IReporterModel>>
  >(reporterId);
}

