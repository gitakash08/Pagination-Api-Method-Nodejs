getSearchStateDist: async (req, res) => {
  let message = "";
  let pageNumber = parseInt(req.query.pageNumber) || 1;
  let pageSize = parseInt(req.query.pageSize) || 10000;

  let key = `getSearchStateDist-${pageNumber}-${pageSize}`;
  try {
      let value = myCache.get(key);
      if (value != undefined) {
          return res.status(200).json({ status: "OK", data: value });
      } else {
          const offset = (pageNumber - 1) * pageSize;

          let query = `
              SELECT *, ROW_NUMBER () OVER (ORDER BY "Name") as id
              FROM all_india_state_dist
              -- WHERE cast("Hierarchy" as integer) < 3
              OFFSET $1 LIMIT $2
          `;

          db1.query(query, [offset, pageSize], (err, result) => {
              if (err) {
                  return res.status(503).send({
                      status: "NOK",
                      data: err,
                      message: "Messages not available!",
                  });
              }
              if (result.rows.length > 0) {
                  myCache.set(key, result.rows, 30000000000);
                  return res.status(200).json({ status: "OK", data: result.rows });
              } else {
                  return res.status(200).send({ status: "OK", data: [], message: "Data not available!" });
              }
          });
      }
  } catch (e) {
      log.info("getSearchStateDist. [" + e + "]");
      return res.status(200).json({
          status: "NOK",
          message: "Something went wrong. Please try again later",
          data: e,
      });
  }
}