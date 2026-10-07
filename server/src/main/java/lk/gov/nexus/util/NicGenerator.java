package lk.gov.nexus.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

public class NicGenerator {

    /**
     * Official 12-Digit Sri Lankan NIC Generator (YYYY DDD SSSS C)
     */
    public static String generateSriLankan12DigitNIC(String dobString, String gender, Integer serialNum) {
        LocalDate dob;
        try {
            if (dobString != null && !dobString.trim().isEmpty()) {
                dob = LocalDate.parse(dobString.trim().substring(0, 10), DateTimeFormatter.ISO_LOCAL_DATE);
            } else {
                dob = LocalDate.of(2005, 1, 1);
            }
        } catch (Exception e) {
            dob = LocalDate.of(2005, 1, 1);
        }

        int yyyy = dob.getYear();
        int dayOfYear = dob.getDayOfYear();

        String normGender = gender != null ? gender.toLowerCase() : "";
        boolean isFemale = normGender.contains("female") || normGender.contains("ස්ත්‍රී") || normGender.contains("பெண்");
        int dddVal = isFemale ? dayOfYear + 500 : dayOfYear;
        String ddd = String.format("%03d", dddVal);

        int serial = serialNum != null ? serialNum : ThreadLocalRandom.current().nextInt(1000, 10000);
        String ssss = String.format("%04d", serial);

        String rawBase = String.valueOf(yyyy) + ddd + ssss;
        int checkSum = 0;
        for (int i = 0; i < rawBase.length(); i++) {
            checkSum += Character.getNumericValue(rawBase.charAt(i)) * (i + 1);
        }
        int c = checkSum % 10;

        return rawBase + c;
    }

    public static String generateSriLankan12DigitNIC(String dobString, String gender) {
        return generateSriLankan12DigitNIC(dobString, gender, null);
    }
}
