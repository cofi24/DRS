import cx_Oracle

print("uspesno")
dsn = cx_Oracle.makedsn(
    host="localhost",
    port=1521,
    service_name="xepdb1"
)

try:
    connection=cx_Oracle.connect(
        user="Exxxxx",
        password="ftn",
        dsn=dsn
    )

    print("Uspesna konekcija")
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM korisnik")

    # Ispisivanje rezultata
    rows = cursor.fetchall()
    if rows:
        for row in rows:
            print(row)
    else:
        print("Nema korisnika u tabeli.")


except cx_Oracle.DatabaseError as e:
    print(f"greska kod konekcije:{e}")

finally:
    if 'connection' in locals() and connection:
        connection.close()
        print("Konekcija je zatvorena.")