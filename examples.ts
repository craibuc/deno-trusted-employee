import { load } from "https://deno.land/std@0.222.1/dotenv/mod.ts";
const env = await load();

import { TrustedEmployee } from "./mod.ts";

try {

    const te = new TrustedEmployee('Testing', env.TRUSTED_EMPLOYEE_USERID, env.TRUSTED_EMPLOYEE_PASSWORD, env.TRUSTED_EMPLOYEE_ACCOUNT);

    const report_status = await te.get_report_status('2AE21F')
    console.log('report_status',report_status)

    const report_pdf = await te.get_report_pdf('2AE21F')
    console.log('report_pdf',report_pdf.FileNo)

} catch (error) {
    console.error(error.message)
}
