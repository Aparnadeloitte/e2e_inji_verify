import React from "react";
import {
  convertToId,
  convertToTitleCase,
  getDisplayValue,
  saveData,
} from "../../../../utils/misc";
import {
  DocumentIcon,
  VectorDownload,
  VectorExpand,
} from "../../../../utils/theme-utils";
import ActionButton from "../commons/ActionButton";
import { useTranslation } from "react-i18next";
import { getDetailsOrder } from "../../../../utils/commonUtils";
import { VC } from "../../../../types/data-types";

function DisplayVcDetailView({
  vc,
  onExpand,
  className,
}: {
  vc: VC
  onExpand: any;
  className?: string;
}) {
  const { t } = useTranslation("Verify");
  const orderedDetails = getDetailsOrder(vc);

  return (
    <div>
      <div
        className={`w-[339px] lg:w-[410px] m-auto rounded-lg bg-white px-[15px] shadow-lg mb-4 ${className}`}
      >
        {vc ? (
          <div className="relative">
          <div className="grid relative">
          {
                     Object.keys(vc.credentialSubject)
                        .filter(key => key?.toLowerCase() !== "id" && key?.toLowerCase() !== "type")
                        .map((key, index) => (
                            <div className={`py-2.5 px-1 xs:col-end-13 ${(index % 2 === 0) ? "lg:col-start-1 lg:col-end-6" : "lg:col-start-8 lg:col-end-13"}`} key={key}>
                                <p id={convertToId(key)} className="font-normal text-[11px] break-all">
                                    {convertToTitleCase(key)}
                                </p>
                                <p 
                               id={`${convertToId(key)}-value`}
                                 className="font-bold text-smallTextSize break-all"
                                
                                >
                                {getDisplayValue((vc.credentialSubject as Record<string, any>)[key])}
                                </p>
                            </div>
                            
                        ))
                        
                }
            {/* {orderedDetails.map((label, index) => (
              <div
                className={`py-2.5 px-1 xs:col-end-13 ${
                  index % 2 === 0
                    ? "lg:col-start-1 lg:col-end-6"
                    : "lg:col-start-8 lg:col-end-13"
                }`}
                key={label.key}
              >
                <p
                  id={convertToId(label.key)}
                  className="font-normal text-verySmallTextSize break-all text-[#666666]"
                >
                  {convertToTitleCase(label.key)}
                </p>
                <p
                  id={`${convertToId(label.key)}-value`}
                  className="font-bold text-smallTextSize break-all"
                >
                  {getDisplayValue(label.value)}
                </p>
              </div>
            ))} */}
          </div>

          <div className="absolute inset-x-0 bottom-0 flex justify-end lg:justify-start px-4">
            <ActionButton
              label={t("expand")}
              onClick={onExpand}
              icon={<VectorExpand />}
              positionClasses="hidden lg:flex left-[250px] lg:left-[328px] lg:hover:left-[241px] bottom-[60px]"
            />
            <ActionButton
              label={t("download")}
              onClick={() => saveData(vc)}
              icon={<VectorDownload />}
              positionClasses="left-[250px] lg:left-[328px] lg:hover:left-[241px] bottom-[10px]"
            />
          </div>
        </div>
        ) : (
          <div className="grid content-center justify-center w-[100%] h-[320px] text-documentIcon">
            <DocumentIcon />
          </div>
        )}
      </div>
    </div>
  );
}

export default DisplayVcDetailView;
