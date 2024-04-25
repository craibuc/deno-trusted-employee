import { stringify, parse } from "https://deno.land/x/xml/mod.ts";

enum Product {
    "New-Hire" = 1,
    "New Hire + DMV" = 2,
};

export class TrustedEmployee {

    public base_uri: string;

    private userid: string;
    private password: string;
    private account: string;

    constructor (
        server: 'Production' | 'Testing', 
        userid: string, 
        password: string,
        account: string
    ) {
        this.userid = userid
        this.password = password
        this.account = account

        this.base_uri = server==='Production' ? 'https://www.rhris.com' : 'https://www.rhrtest.com'
        // console.log('base_uri',this.base_uri)
    }
  
    get_report_status = async (
        file_number: string
    ) => {

        const body = stringify({
            ReportStatusRequest: {
                PartnerInfo: {
                    UserID: this.userid,
                    Password: this.password,
                },
                Reports: {
                    Report: { FileNo: file_number },
                },
            }
        })
        // console.log('body',body)

        return await fetch(`${this.base_uri}/ReportStatusFetch.cfm`, {
            method: "POST",
            headers: {
                "Content-Type": "application/xml",
                Accept: "application/json",
            },
            body: body,
        })
        .then((response) => response.text())
        .then((text) => parse(text))
        .then((data) => {
            return data.ReportStatusRequest.Reports.Report;
        });

    }

    get_report_pdf = async (
        file_number: string
    ) => {

        const body = stringify({
            ReportCopyRequest: {
                PartnerInfo: {
                    UserID: this.userid,
                    Password: this.password,
                },
                Reports: {
                    Report: { FileNo: file_number },
                },
            }
        })
        // console.log('body',body)

        return await fetch(`${this.base_uri}/ReportPDFFetch.cfm`, {
            method: "POST",
            headers: {
                "Content-Type": "application/xml",
                Accept: "application/json",
            },
            body: body,
        })
        .then((response) => response.text())
        .then((text) => parse(text))
        .then((data) => {
            return data.ReportCopyRequest.Reports.Report;
        });

    }

    request_report = async (
        webHookUri: string,
        product: "New-Hire" | "New Hire + DMV",
        requestedBy: string,
        reference: string,
        reportCopy: boolean,
        applicantID: string,
        // required: New Hire + DMV
        dlNumber: string,
        dlState: string,
        // required
        firstName: string,
        middleName: string,
        lastName: string,
        birthDate: Date,
        ssn: string,
        phone: string,
        email: string,
        street: string,
        unit: string,
        city: string,
        state: string,
        zip: string,
        workState: string,      
    ) => {

        // remove keys that have a null value
        const body = stringify({
            ScreenRequest: {
                PartnerInfo: {
                    UserID: this.userid,
                    Password: this.password,
                },
                Account: {
                    AcctNbr: this.account,
                    PostBackURL: {
                        "_Attribs": {
                            CredentialType: "NONE",
                        },
                        "_Data": webHookUri,
                    },
                    Applicant: {
                        //required
                        ApplicantID: applicantID,
                        //required
                        Package: Product[product],
                        RequestedBy: requestedBy,
                        Reference: reference,
                        DLNumber: dlNumber,
                        DLState: dlState,
                        //required
                        FirstName: firstName,
                        MiddleName: middleName,
                        //required
                        LastName: lastName,
                        //required; yyyy-mm-dd
                        BirthDate: birthDate.toISOString().split("T")[0],
                        //required; '001002003'
                        SSN: ssn.replaceAll("-", ""),
                        // SSN: ssn.replace(/-/g, ""),
                        // '123-123-1234'
                        Phone: phone.replace(/[\(\)\+]/g, "").replace(/\s/g, "-"),
                        Email: email,
                        //required
                        Street: street,
                        Unit: unit,
                        //required
                        City: city,
                        //required
                        State: state,
                        //required
                        Zip: zip,
                        //required
                        WorkState: workState,
                        // SalaryOver25K: SalaryOver25K
                        ReportCopy: reportCopy ? "YES" : "NO",
                    },
                },
            }
        });
        console.log('body',body)

        return await fetch(`${this.base_uri}/BatchScreensXML.cfm`, {
            method: "POST",
            headers: {
              "Content-Type": "application/xml",
              Accept: "application/json",
            },
            body: body,
        })
        .then((response) => response.text())
        .then((text) => parse(text))
        .then((data) => data);
        
    }

}
